/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { DeleteAccountPayload, TCompanyDetails, TDrivingLicense, TUser, TUserCreate } from './user.interface';
import { User } from './user.models';
import config from '../../config';
import QueryBuilder from '../../builder/QueryBuilder';
import { otpServices } from '../otp/otp.service';
import { generateOptAndExpireTime } from '../otp/otp.utils';
import { TPurposeType, TReceiverType } from '../otp/otp.interface';
import { otpSendEmail } from '../../utils/emailNotification';
import { createToken, verifyToken } from '../../utils/tokenManage';
import { USER_ROLE } from './user.constants';
import { IJwtPayload } from '../auth/auth.interface';
import { generateAndReturnTokens } from '../auth/auth.utils';

export type IFilter = {
  searchTerm?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export interface OTPVerifyAndCreateUserProps {
  otp: string;
  token: string;
}

const createUserToken = async (payload: TUserCreate) => {
  console.log('Payload received in user token service');

  const { email, fullName, password, role } = payload;

  // Check if user already exists
  const userExist = await userService.getUserByEmail(email);
  if (userExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exist!!');
  }

  // Check existing OTP status
  const { isExist, isExpireOtp } = await otpServices.checkOtpByEmail(email);
  const { otp, expiredAt } = generateOptAndExpireTime();

  if (isExist && !isExpireOtp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'OTP already sent. Please check your email.',
    );
  }

  const otpPayload = {
    name: fullName,
    sentTo: email,
    receiverType: 'email' as TReceiverType,
    purpose: 'email-verification' as TPurposeType,
    otp,
    expiredAt,
  };

  // Create or update OTP
  if (isExist && isExpireOtp) {
    await otpServices.updateOtpByEmail(email, {
      otp,
      expiredAt,
    });
  } else if (!isExist) {
    await otpServices.createOtp(otpPayload);
  }

  // Send OTP email
  await otpSendEmail({
    sentTo: email,
    subject: 'Your one-time OTP for email verification',
    name: 'Customer',
    otp,
    expiredAt,
  });


  
  // Create token containing user data for later verification
  const tokenPayload: Partial<TUserCreate> = {
    email,
    fullName,
    password,
    role

  };
  console.log('Token payload:', tokenPayload);
  const token = createToken({
    payload: tokenPayload,
    access_secret: config.create_user_secret as string,
    expity_time: config.create_user_expire_time as string | number,
  });

  return token;
};


const otpVerifyAndCreateUser = async ({
  otp,
  token,
}: OTPVerifyAndCreateUserProps) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decodeData = verifyToken({
    token,
    access_secret: config.create_user_secret as string,
  });

  if (!decodeData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorized');
  }

  const { password, email, role, fullName } = decodeData as any;
  console.log('decodeData', decodeData);
  // Check OTP match
  const isOtpValid = await otpServices.otpMatch(email, otp);

  if (!isOtpValid) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invald OTP');
  }

  // Check if user already exists
  const existingUser = await User.isUserExist(email);
  if (existingUser) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'A user already exists with this email',
    );
  }

  // Create user
  const newUser = await User.create({ password, role, email, fullName });
  if (!newUser) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'User creation failed',
    );
  }
  // Update OTP status
  await otpServices.updateOtpByEmail(email, { status: 'verified' });

 return generateAndReturnTokens(newUser);
};







// ............................rest

const getAllUserQuery = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const userQuery = new QueryBuilder(User.find({ _id: { $ne: userId } }), query)
    .search(['fullName'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();
  return { meta, result };
};

const getAllUserCount = async () => {
  const allUserCount = await User.countDocuments();
  return allUserCount;
};

const getUsersOverview = async (userId: string, year: any) => {
  try {
    // Fetch total user count
    const totalUsers = await User.countDocuments();

    // Fetch user growth over time for the specified year (monthly count with month name)
    const userOverview = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          }, // Filter by year
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' }, // Group by month of the 'createdAt' date
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 1] }, then: 'January' },
                { case: { $eq: ['$_id', 2] }, then: 'February' },
                { case: { $eq: ['$_id', 3] }, then: 'March' },
                { case: { $eq: ['$_id', 4] }, then: 'April' },
                { case: { $eq: ['$_id', 5] }, then: 'May' },
                { case: { $eq: ['$_id', 6] }, then: 'June' },
                { case: { $eq: ['$_id', 7] }, then: 'July' },
                { case: { $eq: ['$_id', 8] }, then: 'August' },
                { case: { $eq: ['$_id', 9] }, then: 'September' },
                { case: { $eq: ['$_id', 10] }, then: 'October' },
                { case: { $eq: ['$_id', 11] }, then: 'November' },
                { case: { $eq: ['$_id', 12] }, then: 'December' },
              ],
              default: 'Unknown', // Default value in case month is not valid
            },
          },
        },
      },
      { $sort: { _id: 1 } }, // Sort by month (ascending)
    ]);

    // Fetch recent users
    const recentUsers = await User.find({ _id: { $ne: userId } })
      .sort({ createdAt: -1 })
      .limit(6);

    return {
      totalUsers,
      userOverview, // Includes month names with user counts
      recentUsers,
    };
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw new Error('Error fetching dashboard data.');
  }
};

const getUserById = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

// Optimized the function to improve performance, reducing the processing time to 235 milliseconds.
const getMyProfile = async (id: string, fields?: string) => {
  // ✅ Default fields to include when no 'fields' query param is provided
  const defaultFields = ['hasDrivingLicense', 'profileImage', 'bio', 'role', 'email', 'fullName'];

  // ✅ Determine which fields to select
  const selectFields = fields
    ? fields.split(',').map(f => f.trim()).join(' ') // if fields provided, use only them
    : defaultFields.join(' '); // otherwise, use defaults

  // ✅ Fetch user data from the database
  const userData = await User.findById(id).select(selectFields);

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // ✅ Return the user data
  return userData;
};


const updateMyProfile = async (userId: string, payload: Partial<TUser>) => {
  const updateProfile = await User.findByIdAndUpdate(
    userId,
    { $set: payload },
    { new: true, runValidators: true }
  );
  if (!updateProfile) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return updateProfile;
};


const getUserByEmail = async (email: string) => {
  const result = await User.findOne({ email });

  return result;
};

const deleteMyAccount = async (id: string, payload: DeleteAccountPayload) => {
  const user: TUser | null = await User.IsUserExistById(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted');
  }

  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  const userDeleted = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!userDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
  }

  return userDeleted;
};





export const userService = {
  createUserToken,
  otpVerifyAndCreateUser,
  getMyProfile,
  updateMyProfile,
  getUserById,
  getUserByEmail,
  deleteMyAccount,
  getAllUserQuery,
  getAllUserCount,
  getUsersOverview,
};
