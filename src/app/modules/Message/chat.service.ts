
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { Chat, Message } from './chat.model';
import { User } from '../user/user.models';
import { IJwtPayload } from '../auth/auth.interface';
import httpStatus from 'http-status';
import { USER_ROLE } from '../user/user.constants';

const uploadChatDocument = async (documents: any) => {
  return documents;

};

const getOrCreateChat = async (userData: IJwtPayload, targetId: string) => {

  if (!targetId) throw new AppError(httpStatus.BAD_REQUEST, 'Target user id is required');

  const targetUser = await User.findById(targetId).lean();

  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'Target user not found');
  }
  if (targetUser.role === USER_ROLE.ADMIN) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot create chat with admin user');
  }
  if (targetUser._id.toString() === userData.userId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot create chat with yourself');
  }
  if (targetUser.role === userData.role) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot create chat with same role user');
  }
  if (userData.role === USER_ROLE.HOST && targetUser.role !== USER_ROLE.GUEST) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Hosts can only create chats with Guests');
  }
  const participants = userData.role === USER_ROLE.HOST ? { host: userData.userId, guest: targetId } : { host: targetId, guest: userData.userId };
  // const userId = userData.userId;
  let chat = await Chat.findOne(participants);
  if (!chat) {
    chat = await Chat.create(participants);
  }
  return chat;
};





const getUserChats = async (userData: IJwtPayload, query: Record<string, unknown>) => {
  let chatQuery;
  if (userData.role === USER_ROLE.HOST) {
    chatQuery = Chat.find({ host: userData.userId, hasChat: true })
      .populate({ path: "guest", select: "fullName profileImage" })
      .sort({ updatedAt: -1 });
  } else {
    chatQuery = Chat.find({ guest: userData.userId, hasChat: true })
      .populate({
        path: "host",
        select: "fullName profileImage"
      })
      .sort({ updatedAt: -1 });
  }

  // Apply pagination & filtering
  const queryBuilder = new QueryBuilder(chatQuery, query).filter().paginate().sort();
  const [chats, meta] = await Promise.all([
    queryBuilder.modelQuery.lean(),
    queryBuilder.countTotal(),
  ]);

  // Format response
  const formattedChats = chats.map((chat: any) => {
    if (userData.role === USER_ROLE.HOST) {
      return {
        _id: chat._id.toString(),
        guestId: chat.guest._id.toString(),
        fullName: chat.guest?.fullName || "",
        profileImage: chat.guest?.profileImage || "",
        lastMessage: chat.lastMessage || null,
        updatedAt: chat.updatedAt,
        createdAt: chat.createdAt,
      };
    } else {
      return {
        _id: chat._id.toString(),
        hostId: chat.host._id.toString(),
        fullName: chat.host?.fullName || "",
        profileImage: chat.host?.profileImage || "",
        lastMessage: chat.lastMessage || null,
        updatedAt: chat.updatedAt,
        createdAt: chat.createdAt,
      };
    }
  });

  return { meta, chats: formattedChats };
};



const getMessages = async (
  userData: IJwtPayload,
  chatId: string,
  query: Record<string, unknown>
) => {
  const chat = await Chat.findById(chatId).lean();
  if (!chat) throw new AppError(404, "Chat not found");

  const userId = userData.userId;
  // Determine the other user
  let otherUserId: Types.ObjectId | null = null;
  if (chat.host.toString() === userId.toString()) {
    otherUserId = chat.guest;
    // Fetch other user info
    const otherUser = await User.findById(otherUserId)
      .select("fullName email profileImage")
      .lean();

    // Fetch messages with query builder
    const messageQuery = new QueryBuilder(Message.find({ chatId }), query)
      .filter()
      .paginate()
      .sort();
    const [messages, meta] = await Promise.all([messageQuery.modelQuery, messageQuery.countTotal()]);
    // const messages = await messageQuery.modelQuery.lean();
    // const meta = await messageQuery.countTotal();

    return { meta, messages, userInfo: otherUser };
  } else if (chat.guest.toString() === userId.toString()) {
    otherUserId = chat.host;
    const otherUser = await User.findById( otherUserId )
      .select("fullName email profileImage")
      .lean();
    // const userInfo = {
    //   _id: (otherUser?.userId as any)._id.toString(),
    //   fullName: otherUser?.fullName || '',
    //   email: otherUser?.email || '',
    //   profileImage: (otherUser?.userId as any).hostProfileImg || '',
    //   // hostProfileImg: otherUser?.hostDataId?.hostProfileImg || '',
    // }
    // Fetch messages with query builder
    const messageQuery = new QueryBuilder(Message.find({ chatId }), query)
      .filter()
      .paginate()
      .sort();
    const [messages, meta] = await Promise.all([messageQuery.modelQuery, messageQuery.countTotal()]);
    // const messages = await messageQuery.modelQuery.lean();
    // const meta = await messageQuery.countTotal();

    return { meta, messages, userInfo:otherUser };
  }

  if (!otherUserId) throw new AppError(404, "Other user not found");


};

export const ChatService = {
  uploadChatDocument,
  getOrCreateChat,
  getUserChats,
  getMessages,
};
