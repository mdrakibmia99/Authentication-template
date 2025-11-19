import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../error/AppError';
import catchAsync from '../utils/catchAsync';
import { verifyToken } from '../utils/tokenManage';
import config from '../config';
import { User } from '../modules/user/user.models';

const auth = (...allowedRoles: string[]) => {
  return catchAsync(async (req, res, next) => {
    const token: string | undefined =
      req.headers?.authorization?.split(' ')[1] || req.headers?.token as string;
    console.log('Auth Middleware');
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    // Verify JWT
    const decoded: any = verifyToken({
      token,
      access_secret: config.jwt_access_secret as string,
    });

    if (!decoded) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token!');
    }

    const user = await User.IsUserExistById(decoded.userId);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (user.role !== decoded.role) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!.');
    }

    // Check if user changed password after token was issued
    if (user.passwordChangedAt) {
      const passwordChangedAt = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
      if (decoded.iat < passwordChangedAt) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'Password recently changed. Please login again.'
        );
      }
    }

    // Check user role
    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }

    req.user = decoded;
    console.log(req.user, "testing=>>>>>>>");
    next();
  });
};

export default auth;
