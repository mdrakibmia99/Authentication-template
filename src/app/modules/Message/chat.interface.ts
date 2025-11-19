import { Types } from 'mongoose';

export interface IChat {
  _id?: Types.ObjectId;
  guest: Types.ObjectId;
  host: Types.ObjectId;
  hasChat?: boolean;
  lastMessage: {
    text: string;
    file: string[];
    sender: Types.ObjectId;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessage {
  _id?: Types.ObjectId;
  chatId: Types.ObjectId;
  sender: Types.ObjectId;
  file?: string[];
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}