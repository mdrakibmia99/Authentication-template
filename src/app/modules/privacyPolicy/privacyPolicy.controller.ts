import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import httpStatus from "http-status";
import PrivacyPolicyService from "./privacyPolicy.service";

const setPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const result = await PrivacyPolicyService.setPrivacyPolicy(req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'set privacy policy successfully',
    data: result,
  });
});
const getPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const result = await PrivacyPolicyService.getPrivacyPolicy()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get privacy policy retrieve successfully',
    data: result,
  });
});

const PrivacyPolicyController={
setPrivacyPolicy,
getPrivacyPolicy
}
export default PrivacyPolicyController