import AppError from "../../error/AppError";
import { User } from "../user/user.models";
import httpStatus from "http-status";

const blockedUser = async (adminId: string, targetId: string) => {
  const singleUser = await User.findById(targetId);
  if (!singleUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (singleUser.role === 'admin') {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'You cannot delete another admin or yourself.',
    );
  }

  let status = !singleUser.isBlocked;
  const user = await User.findByIdAndUpdate(
    targetId,
    { isBlocked: status },
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User blocking failed! Please try again.');
  }

  return { status, user };
};
const deleteUser = async (adminId: string, targetId: string) => {
  const user = await User.findById(targetId);
  if (!user) throw new Error('User not found');
  if (user.role === 'admin') {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'You cannot delete another admin or yourself.',
    );
  }
  const updatedUser = await User.findByIdAndUpdate(
    targetId,
    { isDeleted: true },
    { new: true },
  );

  return updatedUser;
};

export const adminService = {
  blockedUser,
  deleteUser
};