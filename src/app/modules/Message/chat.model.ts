// chat.model.ts
import { Schema, model, Types } from 'mongoose';
import { IChat, IMessage } from './chat.interface';
import { channel } from 'diagnostics_channel';


const ChatSchema = new Schema<IChat>(
  {
    host: { type: Schema.Types.ObjectId, ref: "User", required: true },
    guest: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hasChat: { type: Boolean, default: false },
    lastMessage: {
      text: { type: String, default: '' },
      file: { type: [String], default: [] },
      sender: { type: Schema.Types.ObjectId, ref: 'User' },
    },
  },
  { timestamps: true }
);

ChatSchema.index({ host: 1, guest: 1 }, { unique: true });
ChatSchema.index({ guest: 1 });
ChatSchema.index({ host: 1 });

const MessageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    file: { type: [String], default: [] },
    text: { type: String, default: '' },

  },
  { timestamps: true }
);

ChatSchema.index({ participants: 1 }, { unique: true });
MessageSchema.index({ chatId: 1, sender: 1 });

export const Chat = model<IChat>('Chat', ChatSchema);
export const Message = model<IMessage>('Message', MessageSchema);
