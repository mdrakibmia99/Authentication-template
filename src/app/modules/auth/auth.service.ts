import { User } from './../user/user.models';
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../error/AppError';
import { otpSendEmail } from '../../utils/emailNotification';
import { createToken, verifyToken } from '../../utils/tokenManage';
import { checkOtpByEmail, otpServices, updateOtpByEmail, updateOtpByPhone } from '../otp/otp.service';
import { generateOptAndExpireTime } from '../otp/otp.utils';
import { TUser } from '../user/user.interface';
import { OTPVerifyAndCreateUserProps } from '../user/user.service';
import { IJwtPayload, TLogin } from './auth.interface';
import { LOGIN_WITH } from './auth.constant';
import { generateAndReturnTokens, verifyGoogleToken } from './auth.utils';
import { USER_ROLE } from '../user/user.constants';
import { getAdminId } from '../../db/adminStore';
import { TPurposeType, TReceiverType } from '../otp/otp.interface';

import twilio from 'twilio';
// Twilio credentials
const accountSid = config.twilio_account_sid;
const authToken = config.twilio_auth_token;
const twilioPhone = config.twilio_phone_number;
// Create a Twilio client
const client = twilio(accountSid, authToken);
// Login
const login = async (payload: TLogin) => {
  console.log('payload', payload);
  const user = await User.findOne({ email: payload?.email }).select('+password');

  console.log("user ->>>>> ", user);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }
  console.log("checkPassword ->>>>> ", payload.password, user.password);
  const checkPassword = await User.isPasswordMatched(payload.password, user.password)
  if (!checkPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }
  console.log("user after password ->>>>> ", user);
  return generateAndReturnTokens(user);
};
const googleLogin = async (accessToken: string) => {
  // Check if the user exists
  const googleUser = await verifyGoogleToken(accessToken);
  if (!googleUser) throw new AppError(httpStatus.FORBIDDEN, 'User not found');
  // let user = await User.findOne({ googleId: googleUser.sub }).setOptions({ overrideDeletedFilter: true });
  let user = await User.findOne({ email: googleUser.email }).setOptions({ overrideDeletedFilter: true });
  console.log({ user, googleUser }, 'user,googleUser');
  if (user) {
    // Validate user status and permissions
    if (user.isBlocked) throw new AppError(httpStatus.FORBIDDEN, 'This account is blocked');
    if (user.loginWth !== LOGIN_WITH.GOOGLE) throw new AppError(httpStatus.FORBIDDEN, `This account is not registered with Google login. Try logging in with ${user.loginWth}`);
    if (user.isDeleted) throw new AppError(httpStatus.FORBIDDEN, 'This google account you can not use, because your account is deleted. Please contact to admin.');
    if (user.isBlocked) throw new AppError(httpStatus.FORBIDDEN, 'User account is blocked');

    const onlyUsrData = await User.findById(user._id);
    return generateAndReturnTokens(onlyUsrData);


  }

  // If user does not exist, create a new one
  user = await User.create({
    fullName: googleUser.name,
    googleId: googleUser.sub,
    email: googleUser.email,
    password: googleUser.sub, // just use for database validation, we use google login so, no need to verify password
    profileImage: googleUser.picture,
    role: USER_ROLE.USER,
    loginWth: LOGIN_WITH.GOOGLE,
    userVerification: true,
  });


  return generateAndReturnTokens(user);
};

// forgot Password by email

const forgotPasswordByEmail = async (email: string) => {

  const user: TUser | null = await User.isUserActive(email);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const { isExist, isExpireOtp } = await otpServices.checkOtpByEmail(email);

  const { otp, expiredAt } = generateOptAndExpireTime();

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

  const jwtPayload = {
    email: email,
    userId: user?._id,
  };

  const forgetToken = createToken({
    payload: jwtPayload,
    access_secret: config.forget_jwt_secret as string,
    expity_time: config.forget_expire_time as string | number,
  });

  process.nextTick(async () => {
    await otpSendEmail({
      sentTo: email,
      subject: 'Your one time otp for forget password',
      name: '',
      otp,
      expiredAt: expiredAt,
    });
  });

  return { forgetToken };
};

// forgot Password by number

const forgotPasswordByNumber = async (phoneNumber: string) => {
  if (!phoneNumber) {
    throw new AppError(httpStatus.BAD_REQUEST, 'phone number is required');
  }


  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    // // Send the SMS
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: twilioPhone,
      to: phoneNumber,
    });

    return { message: 'OTP sent successfully', otp };
    // res.status(200).json({ message: "OTP sent successfully", otp }); // For dev, include OTP (remove in prod)
  } catch (error: any) {
    return { message: 'Failed to send OTP', error: error.message };
    // res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};


// forgot  Password Otp Match
const forgotPasswordOtpMatch = async ({
  otp,
  token,
}: OTPVerifyAndCreateUserProps) => {
  console.log({ otp, token });
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decodeData = verifyToken({
    token,
    access_secret: config.forget_jwt_secret as string,
  });

  if (!decodeData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorized');
  }

  const { email } = decodeData;

  const isOtpMatch = await otpServices.otpMatch(email, otp);

  if (!isOtpMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  process.nextTick(async () => {
    await otpServices.updateOtpByEmail(email, {
      status: 'verified',
    });
  });

  const user: TUser | null = await User.isUserActive(email);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const jwtPayload = {
    email: email,
    userId: user?._id,
    role: user?.role,
    fullName: user?.fullName || '',
  };

  const forgetOtpMatchToken = createToken({
    payload: jwtPayload,
    access_secret: config.otp_jwt_secret as string,
    expity_time: config.otp_token_expire_time as string | number,
  });

  return forgetOtpMatchToken;
};
// Phone verification Otp Match
const phoneVerificationOtpMatch = async ({
  otp,
  token,
}: OTPVerifyAndCreateUserProps) => {
  console.log({ otp, token });
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decodeData = verifyToken({
    token,
    access_secret: config.jwt_access_secret as string,
  });

  if (!decodeData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorized');
  }

  const { phone, email, userId } = decodeData;

  const isOtpMatch = await otpServices.otpMatch(phone, otp);

  if (!isOtpMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  process.nextTick(async () => {
    await otpServices.updateOtpByEmail(phone, {
      status: 'verified',
    });
  });

  const user: TUser | null = await User.findById(userId).populate('hostDataId');

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }
  await User.findByIdAndUpdate(user._id, { isPhoneVerify: true }, { new: true, runValidators: true });
  const jwtPayload = {
    email: email,
    userId: user?._id,
    role: user?.role,
    fullName: user?.fullName || '',
    // phone: user?.phone || '',
    isPhoneVerify: true,
  };

  const phoneMatchToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.otp_token_expire_time as string | number,
  });

  return phoneMatchToken;
};













// Reset password Otp Match
const resetPassword = async ({
  token,
  newPassword,
  confirmPassword,
}: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  console.log(newPassword, confirmPassword);
  if (newPassword !== confirmPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decodeData = verifyToken({
    token,
    access_secret: config.otp_jwt_secret as string,
  });

  if (!decodeData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorized');
  }

  const { email, userId, iat } = decodeData;
  console.log("decodeData ->> ", decodeData);

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }
  if (user.passwordChangedAt) {
    const passwordChangedAt = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
    console.log("passwordChangedAt ->> ", passwordChangedAt, iat);
    if (iat && iat < passwordChangedAt) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Password recently changed. Please login again.'
      );
    }
  }


  user.password = newPassword; // triggers pre-save hook

  await user.save();
  return generateAndReturnTokens(user);

};

// Change password
const changePassword = async ({
  userId,
  newPassword,
  oldPassword,
}: {
  userId: string;
  newPassword: string;
  oldPassword: string;
}) => {
  const user = await User.IsUserExistById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isMatched = await User.isPasswordMatched(oldPassword, user.password);
  if (!isMatched) {
    throw new AppError(httpStatus.FORBIDDEN, 'Old password does not match');
  }

  user.password = newPassword; // triggers pre-save hook
  await user.save();
  let jwtPayload: IJwtPayload;

  jwtPayload = {
    fullName: user?.fullName || '',
    email: user.email,
    userId: user?._id?.toString() as string,
    role: user?.role,
  };         // passwordChangedAt will be updated automatically

  const accessToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.jwt_access_expires_in as string,
  });

  console.log({ accessToken });

  const refreshToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_refresh_secret as string,
    expity_time: config.jwt_refresh_expires_in as string,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};


// Forgot password

// Refresh token
const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decoded = verifyToken({
    token,
    access_secret: config.jwt_refresh_secret as string,
  });

  const { email, iat } = decoded;
  console.log("decoded data ->> ", decoded);
  const activeUser = await User.isUserActive(email);

  if (!activeUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // ✅ Check if password changed after token was issued
  if (activeUser.passwordChangedAt) {
    const pwdChangedTime = Math.floor(new Date(activeUser.passwordChangedAt).getTime() / 1000);
    if (iat && iat < pwdChangedTime) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Password changed. Please login again.'
      );
    }
  }

  const jwtPayload: IJwtPayload = {
    fullName: activeUser?.fullName || '',
    email: activeUser.email,
    userId: activeUser?._id?.toString() as string,
    role: activeUser?.role
  };

  const accessToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.jwt_access_expires_in as string,
  });

  return {
    accessToken,
  };
};

const resendOtpPhone = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }
  const decodeData = verifyToken({
    token,
    access_secret: config.jwt_access_secret as string,
  });
  const { phone, role } = decodeData;
  if (role !== USER_ROLE.VENDOR) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Only host can resend otp');
  }
  // if (isPhoneVerify) {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'Your phone number is already verified');
  // }
  if (!phone) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Phone number not found');
  }
  const { isExist, isExpireOtp } = await checkOtpByEmail(phone);
  const { otp, expiredAt } = generateOptAndExpireTime();

  const otpPayload = {
    sentTo: phone,
    receiverType: 'phone' as TReceiverType,
    purpose: 'phone-verification' as TPurposeType,
    otp,
    expiredAt,
  };

  if (!isExist) {
    await otpServices.createOtp(otpPayload);
  } else if (isExist && !isExpireOtp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Otp exist. Please check you phone.',
    );
  } else if (isExist && isExpireOtp) {
    const otpUpdateData = {
      otp,
      expiredAt,
    };

    await updateOtpByPhone(phone, otpUpdateData);
  }

  // process.nextTick(async () => {

  try {
    console.log('phone check ->> ', phone, twilioPhone, accountSid, authToken);
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: twilioPhone,
      to: phone,
    });

    return { message: 'OTP sent successfully', otp };
    // res.status(200).json({ message: "OTP sent successfully", otp }); // For dev, include OTP (remove in prod)
  } catch (error: any) {
    console.log('error ->> ', error);
    return { message: 'Failed to send OTP', error: error.message };
    // res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
  // });
};
export const authServices = {
  login,
  googleLogin,
  forgotPasswordOtpMatch,
  phoneVerificationOtpMatch,
  changePassword,
  forgotPasswordByEmail,
  forgotPasswordByNumber,
  resetPassword,
  refreshToken,
  resendOtpPhone
};


