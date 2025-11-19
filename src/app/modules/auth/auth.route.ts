import { Router } from 'express';
import { authControllers } from './auth.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { authValidation } from './auth.validation';
import { USER_ROLE } from '../user/user.constants';
import { authLimiter } from '../../utils/rateLimiter';

export const authRoutes = Router();

authRoutes
  .post('/login', validateRequest(authValidation.loginZodValidationSchema), authControllers.login)
  // .post('/login', validateRequest(authValidation.loginZodValidationSchema), authLimiter, authControllers.login)
  .post('/google-login', validateRequest(authValidation.googleLoginValidationSchema), authControllers.googleLogin)

  .post(
    '/refresh-token',
    validateRequest(authValidation.refreshTokenValidationSchema),
    authControllers.refreshToken,
  )
  .post(
    '/forgot-password-otpByEmail',
    validateRequest(authValidation.forgetPasswordValidationSchemaByEmail),
    authControllers.forgotPassword,
  )

  .post(
    '/forgot-password-otpByNumber',
    validateRequest(authValidation.forgetPasswordValidationSchemaByNumber),
    authControllers.forgotPassword,
  )

  .patch(
    '/change-password',
    auth(
      USER_ROLE.VENDOR,
      USER_ROLE.USER,
      USER_ROLE.ADMIN,

    ),
    authControllers.changePassword,
  )

  .patch(
    '/forgot-password-otp-match',
    validateRequest(authValidation.otpMatchValidationSchema),
    authControllers.forgotPasswordOtpMatch,
  )
  .patch(
    '/forgot-password-reset',
    // auth(USER_ROLE.VENDOR, USER_ROLE.USER, USER_ROLE.ADMIN),
    validateRequest(authValidation.resetPasswordValidationSchema),
    authControllers.resetPassword,
  )
  .patch(
    '/send-or-resend-otp-phone',
    // validateRequest(authValidation.resetPasswordValidationSchema),
    auth(USER_ROLE.VENDOR),
    authControllers.resendOtpPhone,
  )
  .patch(
    '/verification-phone-otp-match',
    validateRequest(authValidation.otpMatchValidationSchema),
    authControllers.phoneVerificationOtpMatch,
  )
