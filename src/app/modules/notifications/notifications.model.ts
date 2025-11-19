import { Schema, model } from 'mongoose';
import { INotification, NotificationEnum, NotificationType } from './notifications.interface';


const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    message: {
      type: String,
      required: true,

    },
    type: {
      type: String,
      enum: NotificationEnum,
      default: NotificationType.UPDATED,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Create and export the Notification model
const Notification = model<INotification>('Notification', NotificationSchema);

export default Notification;