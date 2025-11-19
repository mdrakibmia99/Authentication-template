import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { adminService } from "./admin.service";
import httpStatus from "http-status";

const blockedUser = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.blockedUser(req.user?.userId, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User ${result.status ? 'blocked' : 'unBlocked'} successfully`,
    data: result.user,
  });
});
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await adminService.deleteUser(req.user?.userId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `user deleted successfully`,
    data: result,
  });
});
export const adminController = {
  blockedUser,
  deleteUser
};