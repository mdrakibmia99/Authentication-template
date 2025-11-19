
import colors from 'colors';
import { createServer, Server } from 'http';
import mongoose from 'mongoose';
import { Server as SocketIoServer } from 'socket.io';
import app from './app';
import config from './app/config';

import createDefaultAdmin from './app/db/createDefaultAdmin';
import socketIO from './socketIo';
let server: Server;

// Separate server for Socket.IO
const socketServer = createServer();

// Initialize Socket.IO on separate server
export const IO: SocketIoServer = new SocketIoServer(socketServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  transports: ['websocket'],
});

// ================= Main Function =================
async function main() {
  try {
    // Connect to database
    await mongoose.connect(config.database_url as string);
    console.log(colors.green('✅ Database connected successfully').bold);
    // Enable query logging in development
    mongoose.set('debug', process.env.NODE_ENV === 'development');
    // Start Express API server
    server = app.listen(config.port, () => {
      console.log(
        colors.green(`🚀 API Server running at ${config.ip}:${config.port}`).bold
      );

    });

    // Start Socket.IO server on separate port
    socketServer.listen(config.socket_port, () => {
      console.log(
        colors.yellow(`⚡ Socket.IO Server running at ${config.ip}:${config.socket_port}`).bold
      );

    });

    // Initialize socket events
    socketIO(IO);
    globalThis.io = IO;
    createDefaultAdmin()

  } catch (error: any) {
    console.error('❌ Server start error:', error);
    process.exit(1);
  }
}

// ================= Graceful Shutdown =================
process.on('unhandledRejection', (err: any) => {
  console.error('⚠️ Unhandled Rejection', err);
  if (server) server.close(() => process.exit(1));
  process.exit(1);
});

process.on('uncaughtException', (err: any) => {
  console.error('⚠️ Uncaught Exception', err);
  process.exit(1);
});
main();
