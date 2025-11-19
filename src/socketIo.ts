import { Server as SocketIOServer, Socket } from 'socket.io';
import mongoose from 'mongoose';
import colors from 'colors';
import { verifyToken } from './app/utils/tokenManage';
import config from './app/config';
import { User } from './app/modules/user/user.models';
import Notification from './app/modules/notifications/notifications.model';
import AppError from './app/error/AppError';
import httpStatus from 'http-status';
import { USER_ROLE } from './app/modules/user/user.constants';
import { Chat, Message } from './app/modules/Message/chat.model';
import { IJwtPayload } from './app/modules/auth/auth.interface';
const isValidId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// =====================
// Connected users store
// =====================
interface ConnectedUser {
  socketIDs: Set<string>; // multiple devices support
  role?: string;
}
declare module 'socket.io' {
  interface Socket {
    user: {
      userId: string;
      role: string;
      fullName: string;
      email: string;
      phone?: string;
      isPhoneVerify?: boolean;
      iat?: number;
      exp?: number;
    };
  }
}

export const connectedUsers = new Map<string, ConnectedUser>();
const socketUserMap = new Map<string, string>(); // socketID -> userId for O(1) disconnect

// =====================
// Get io instance
// =====================
let io: SocketIOServer;
export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

// =====================
// Initialize Socket.IO
// =====================
export default function initSocket(ioInstance: SocketIOServer) {
  io = ioInstance;
  console.log(colors.yellow('🔌 Socket.IO initialized').bold);

  // =====================
  // JWT Auth middleware
  // =====================
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        (socket.handshake.auth.token as string) ||
        (socket.handshake.headers.token as string) ||
        (socket.handshake.headers.authorization as string);

      if (!token) throw new AppError(httpStatus.UNAUTHORIZED, 'Token missing');

      const payload = verifyToken({
        token,
        access_secret: config.jwt_access_secret as string,
      });
      console.log(payload);
      if (!payload) throw new Error('Invalid token');
      // Optional: reduce DB hit by using JWT payload
      // const user = await User.findById(payload.userId).select('_id fullName email role');
      // if (!user) throw new Error('User not found');

      // socket.user = {
      //   userId: payload.userId.toString(),
      //   name: payload.fullName,
      //   email: payload.email,
      //   role: payload.role,
      // };
      socket.user = payload as IJwtPayload;

      next();
    } catch (err: any) {
      console.error('Socket auth failed:', err.message);
      socket.disconnect(true);
    }
  });

  // =====================
  // Handle connection
  // =====================
  io.on('connection', (socket: Socket) => {
    if (!socket.user?.userId) return;
    const senderRole = socket.user.role
    const userId = socket.user.userId
    // const userId = socket.user.userId;

    // Add socketID to user's connected devices
    if (!connectedUsers.has(userId)) { connectedUsers.set(userId, { socketIDs: new Set() }); }
    connectedUsers.get(userId)?.socketIDs.add(socket.id);
    socketUserMap.set(socket.id, userId);

    console.log(`✅ User ${userId} connected [${socket.id}]`);
    // Emit online (first connection only)
    if (connectedUsers.get(userId)?.socketIDs.size === 1) {
      io.emit('userOnline', { userId });
    }



    // =====================
    // Join multiple rooms (per conversation)
    // =====================


    // =====================
    // Send message to room
    // =====================
    socket.on('sendMessage', async ({ targetId, text, file }) => {
      // ✅ Step 1: Early validation

      if (!isValidId(targetId)) {
        socket.emit('error', { message: 'targetId is required' });
        return;
      }


      if (!text && (!Array.isArray(file) || file.length === 0)) {
        socket.emit('error', { message: 'Either text or minimum 1 file is required' });
        return;
      }

      try {
        // const senderId = socket.user.userId;
        const senderRole = socket.user.role
        const senderId = socket.user.userId
        const participants = senderRole === USER_ROLE.HOST ? { host: senderId, guest: targetId } : { host: targetId, guest: senderId }
        // 1. Find or create the chat for these two participants
        let chat = await Chat.findOne(participants);
        console.log('chat', chat)
        if (!chat) {
          socket.emit('error', { message: 'Chat not found between participants' });
          return; // ❌ don’t create a new one

        }

        // 2. Save the message
        const msg = await Message.create({
          chatId: chat._id,
          sender: senderId,
          text: text || '',
          file: file || [],
        });

        // 3. Update chat lastMessage
        chat.lastMessage = {
          text: text || '',
          file: file || [],
          sender: new mongoose.Types.ObjectId(senderId),
        };
        chat.hasChat = true;
        await chat.save();

        // 4. Emit to target sockets
        const sockets = connectedUsers.get(targetId)?.socketIDs;
        sockets?.forEach(id =>
          io.to(id).emit('receiveMessage', {
            chatId: chat._id,
            senderId,
            text: text || '',
            file: file || [],
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
          })
        );

        // Emit to sender (multi-device sync)
        const senderSockets = connectedUsers.get(senderId)?.socketIDs;
        senderSockets?.forEach(socketID => {
          if (socketID !== socket.id) {
            io.to(socketID).emit('receiveMessage', {
              chatId: chat._id,
              senderId,
              text: text || '',
              file: file || [],
              createdAt: msg.createdAt,
              updatedAt: msg.updatedAt,

            });
          }
        });
      } catch (err: any) {
        // ✅ Step 2: Don’t throw, handle gracefully
        console.error('sendMessage error:', err);
        socket.emit('error', { message: err.message || 'Internal server error' });
        // Optionally log to a monitoring service here
      }
    });

    // =====================
    // Typing indicator
    // =====================
    socket.on('typing', ({ targetId, isTyping }) => {
      if (!isValidId(targetId)) {
        socket.emit('error', { message: 'targetId is required' });
        return;
      }
      const senderRole = socket.user.role
      const senderId = socket.user.userId
      // const senderId = socket.user.userId; // typing user
      const targetSockets = connectedUsers.get(targetId)?.socketIDs;
      console.log({ targetSockets, senderId, senderRole })
      if (targetSockets) {
        targetSockets.forEach(socketID => {
          io.to(socketID).emit('typing', {
            from: senderId,
            isTyping,
          });
        });
      }
    });
    // =====================
    // Disconnect handling
    // =====================
    socket.on('disconnect', () => {
      const uid = socketUserMap.get(socket.id);
      if (!uid) return;

      socketUserMap.delete(socket.id);
      const user = connectedUsers.get(uid);
      if (user) {
        user.socketIDs.delete(socket.id);
        if (user.socketIDs.size === 0) {
          connectedUsers.delete(uid);
          io.emit('userOffline', { userId: uid });
        }
      }

      console.log(`❌ User ${uid} disconnected [${socket.id}]`);
      io.emit('onlineUser', Array.from(connectedUsers.keys()));
    });
  });
}

// =====================
// Emit notification
// =====================
export const emitNotification = async ({
  userId,
  receiverId,
  message,
  type,
}: {
  userId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message?: { text?: string; image?: string; photos?: string[] };
  type?: string;
}) => {
  if (!io) throw new Error('Socket.IO not initialized');

  // Get all connected sockets for receiver
  const userSockets = connectedUsers.get(receiverId.toString())?.socketIDs;

  // Get unread count from DB
  const unreadCount = await Notification.countDocuments({ receiverId, isRead: false });

  // Emit to all connected sockets
  if (userSockets && message) {
    userSockets.forEach((socketID) => {
      io.to(socketID).emit('notification', {
        success: true,
        statusCode: 200,
        unreadCount: unreadCount + 1,
        message,
        type,
      });
    });
  }

  // Save to DB asynchronously
  Notification.create({
    userId,
    receiverId,
    message: message?.text || 'New notification',
    type,
    isRead: false,
    timestamp: new Date(),
  }).catch((err) => console.error('Notification save error:', err));
};




