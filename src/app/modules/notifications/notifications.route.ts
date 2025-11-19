import { Router } from 'express';
import auth from '../../middleware/auth';
import { notificationController } from './notifications.controller';
import { otpControllers } from '../otp/otp.controller';
import { USER_ROLE } from '../user/user.constants';

export const notificationRoutes = Router();



notificationRoutes
  .post(
    "/create",
    auth(USER_ROLE.ADMIN,USER_ROLE.HOST,USER_ROLE.GUEST),
    notificationController.createNotification
  )
  // .get(
  //   '/all-notifications', 
  //   auth(USER_ROLE.ADMIN,USER_ROLE.DRIVER,USER_ROLE.EMPLOYEE,USER_ROLE.PASSENGER), 
  //   notificationController.getAllNotifications
  // )

  .get(
    '/my-notifications',
    auth(USER_ROLE.ADMIN, USER_ROLE.HOST, USER_ROLE.GUEST),
    notificationController.getMyNotifications
  )
  .get(
    '/my-unread-notifications',
    auth(USER_ROLE.ADMIN, USER_ROLE.HOST, USER_ROLE.GUEST),
    notificationController.getMyUnReadNotifications
  )

  .patch(
    '/mark-read/:id',
    auth('user'),
    notificationController.markAsRead
  )

  .patch(
    "/read-all",
    auth("user", "admin"),
    notificationController.markAllAsRead
  )


  .delete(
    '/delete/:id',
    auth(USER_ROLE.ADMIN, USER_ROLE.HOST, USER_ROLE.GUEST),
    notificationController.deleteNotification
  );
