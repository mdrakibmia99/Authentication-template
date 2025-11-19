import Otp from './otp.model';
import { CreateOtpParams } from './otp.interface';
import AppError from '../../error/AppError';
import { createToken, verifyToken } from '../../utils/tokenManage';
import httpStatus from 'http-status';
import config from '../../config';
import { generateOptAndExpireTime } from './otp.utils';
import { otpSendEmail } from '../../utils/emailNotification';

const createOtp = async ({
  sentTo,
  receiverType,
  purpose,
  otp,
  expiredAt,
}: CreateOtpParams) => {
  // const expiredAtDate = new Date(expiredAt);
  const newOTP = new Otp({
    sentTo,
    receiverType,
    purpose,
    otp,
    expiredAt,
  });

  await newOTP.save();

  return newOTP;
};

export const checkOtpByEmail = async (email: string) => {
  const isExist = await Otp.findOne({
    sentTo: email,
  });

  console.log({ email });

  console.log({ isExist });

  const isExpireOtp = await Otp.findOne({
    sentTo: email,
    expiredAt: { $lt: new Date() }, // Use the `$gt` operator for comparison
  });

  console.log({ isExpireOtp });

  console.log('.........');

  return { isExist, isExpireOtp };
};

const checkOtpByNumber = async (phone: string) => {
  const isExist = await Otp.findOne({
    sentTo: phone,
  });

  console.log({ phone });

  console.log({ isExist });

  const isExpireOtp = await Otp.findOne({
    sentTo: phone,
    expiredAt: { $lt: new Date() }, // Use the `$gt` operator for comparison
  });

  console.log({ isExpireOtp });

  console.log('.........');

  return { isExist, isExpireOtp };
};

const otpMatch = async (email: string, otp: string) => {
  const isOtpMatch = await Otp.findOne({
    sentTo: email,
    otp,
    status: 'pending',
    expiredAt: { $gt: new Date() },
  });

  console.log({ isOtpMatch });

  return isOtpMatch;
};

export const updateOtpByEmail = async (
  email: string,
  payload: Record<string, any>,
) => {
  console.log(payload);
  const otpUpdate = await Otp.findOneAndUpdate(
    {
      sentTo: email,
    },
    payload,
    { new: true },
  );

  return otpUpdate;
};
export const updateOtpByPhone = async (
  phone: string,
  payload: Record<string, any>,
) => {
  console.log(payload);
  const otpUpdate = await Otp.findOneAndUpdate(
    {
      sentTo: phone,
    },
    payload,
    { new: true },
  );

  return otpUpdate;
};

const resendOtpEmail = async ({ token, query }: { token: string, query: any }) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }
  let decodeData;

  if (query && query.purpose === 'create') {
    decodeData = verifyToken({
      token,
      access_secret: config.create_user_secret as string,
    });
  } else {
    decodeData = verifyToken({
      token,
      access_secret: config.forget_jwt_secret as string,
    });
  }
  const { email } = decodeData;
  const { otp, expiredAt } = generateOptAndExpireTime();
  const { isExist, isExpireOtp } = await otpServices.checkOtpByEmail(email);
  if (isExist && !isExpireOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'otp-exist. Check your email.');
  } else if (isExist && isExpireOtp) {
    const otpUpdateData = {
      otp,
      expiredAt,
      status: 'pending',
    };

    await otpServices.updateOtpByEmail(email, otpUpdateData);
  }
  else if (!isExist) {

    // const newData = {name: "testing", sentTo: email, receiverType: "email", purpose: "email-verification", otp, expiredAt};

    await otpServices.createOtp({ sentTo: email, receiverType: "email", purpose: "email-verification", otp, expiredAt });
  }

  // const jwtPayload = {
  //   email: email,
  //   userId: userId,
  // };

  // const forgetToken = createToken({
  //   payload: jwtPayload,
  //   access_secret: config.forget_jwt_secret as string,
  //   expity_time: config.forget_expire_time as string | number,
  // });

  process.nextTick(async () => {
    await otpSendEmail({
      sentTo: email,
      subject: 'Your one time otp for forget password',
      name: '',
      otp,
      expiredAt: expiredAt,
    });
  });
  return { message: 'OTP resent successfully' }
};




export const otpServices = {
  createOtp,
  checkOtpByEmail,
  checkOtpByNumber,
  otpMatch,
  updateOtpByEmail,
  resendOtpEmail,
};
