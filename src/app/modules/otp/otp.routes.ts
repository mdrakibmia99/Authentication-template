import { Router } from 'express';
import { otpControllers } from './otp.controller'; 
export const otpRoutes = Router();


  otpRoutes.patch('/resend-email-otp', otpControllers.resendOtp);

