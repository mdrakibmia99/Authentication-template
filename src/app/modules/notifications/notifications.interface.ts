import { Schema } from "mongoose";


export interface INotification {
    userId: Schema.Types.ObjectId; // Reference to User
    receiverId: Schema.Types.ObjectId; // Reference to User
    message: string; // Notification message
    type: NotificationTypeValue; // Type of notification
    isRead: boolean; // Whether the notification is read
    
  }


export const NotificationEnum = [
  'interested',
  'notInterested',
  'SendFollow',
  'AcceptFollow',
  'DeclineFollow',
  'Accepted',
  'Rejected',
  'added',
  'created',
  'login',
  'password changed',
  'deleted',
  'updated'
] as const;

export enum NotificationType {
  INTERESTED = 'interested',
  NOT_INTERESTED = 'notInterested',
  SEND_FOLLOW = 'SendFollow',
  ACCEPT_FOLLOW = 'AcceptFollow',
  DECLINE_FOLLOW = 'DeclineFollow',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  ADDED = 'added',
  CREATED = 'created',
  LOGIN = 'login',
  CHANGED_PASSWORD = 'password changed',
  DELETED = 'deleted',
  UPDATED="updated"
}
export type NotificationTypeValue = `${NotificationType}`;