import catchAsync from '../../utils/catchAsync';
import { otpServices } from './otp.service';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';
import AppError from '../../error/AppError';
import { verifyToken } from '../../utils/tokenManage';
import config from '../../config';
import { generateOtp } from '../../utils/otpGenerator';
import { TPurposeType } from './otp.interface';
import moment from 'moment';
import { otpSendEmail } from '../../utils/emailNotification';
import httpStatus from 'http-status';

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers?.token as string;
  const query= req.query;

  console.log({ token });

const result=  await otpServices.resendOtpEmail({ token,query });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP Resent successfully',
    data: result,
  });
});

export const otpControllers = {
  resendOtp,
};
