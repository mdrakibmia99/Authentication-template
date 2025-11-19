import { Router } from 'express';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';
import { otpRoutes } from '../modules/otp/otp.routes';
import { notificationRoutes } from '../modules/notifications/notifications.route';
import { privacyPolicyRoutes } from '../modules/privacyPolicy/privacyPolicy.route';
import { ChatRoutes } from '../modules/Message/chat.routes';
import { RatingRoutes } from '../modules/Rating/rating.route';
import { adminRoutes } from '../modules/Admin/admin.route';





const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/admin',
    route: adminRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/otp',
    route: otpRoutes,
  },

  {
    path: '/notifications',
    route: notificationRoutes,
  },

  {
    path: '/policy',
    route: privacyPolicyRoutes,
  },

  {
    path: '/chat',
    route: ChatRoutes,
  },

  {
    path: '/rating',
    route: RatingRoutes,
  }

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
