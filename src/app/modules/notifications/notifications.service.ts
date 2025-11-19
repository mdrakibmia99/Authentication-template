import { Query } from 'mongoose';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import Notification from './notifications.model';
import { NotificationType, NotificationTypeValue } from './notifications.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { emitNotification } from '../../../socketIo';

interface ICreateNotificationProps {
  userId: string;
  message: string;
  type: NotificationTypeValue;
  receiverId: string;
}

const createNotification = async ({
  userId,
  message,
  type,
  receiverId,
}: ICreateNotificationProps) => {
  const newNotification = new Notification({
    userId,
    receiverId,
    message,
    type,
    isRead: false,
  });

 await newNotification.save();
  console.log(newNotification);
     await emitNotification({
    userId:userId as any,
    receiverId:userId as any,
    message:{
      text:"oi kire oi kire modu modu",
    },
    type:NotificationType.CREATED,
  })
  return newNotification;
};

const getAllNotifications = async (query: Record<string, unknown>) => {
  // You can implement a query builder like in your `userService` for pagination, filtering, etc.
  const notifications = await Notification.find(query);
  return notifications;
};

const getMyNotifications = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const notificationQuery = new QueryBuilder(
    Notification.find({ receiverId: userId }).sort({
      createdAt: -1,
    }),
    query,
  ).paginate().fields();
  const notification = await notificationQuery.modelQuery;
  const meta= await notificationQuery.countTotal();
  return {notification,meta};
};
const getMyUnReadNotifications = async (userId: string) => {
  const unreadCount = await Notification.countDocuments({
    receiverId: userId,
    isRead: false,
  });
  return {unreadCount};
};

const markAsRead = async (id: string) => {
  const notification = await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true },
  );

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  return notification;
};

const markAllAsRead = async (receiverId: string) => {
  const result = await Notification.updateMany(
    { receiverId, isRead: false }, // Only update unread notifications
    { $set: { isRead: true } },
  );

  if (result.modifiedCount === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No unread notifications found');
  }

  return;
};

const deleteNotification = async (notificationId: string, userId: string) => {
  const notification = await Notification.findById(notificationId);
  console.log(notificationId, userId, notification);
  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  if (notification.userId.toString() !== userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You are not authorized to access this notification.',
    );
  }

  await Notification.findByIdAndDelete(notificationId);

  return;
};

export const notificationService = {
  createNotification,
  getAllNotifications,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getMyUnReadNotifications,
};
