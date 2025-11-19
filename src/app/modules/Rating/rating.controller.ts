import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import RatingService from "./rating.service";
import { IJwtPayload } from "../auth/auth.interface";


// 👉 Create a rating
const createRating = catchAsync(async (req: Request, res: Response) => {
  const result = await RatingService.createRating(req.user as IJwtPayload, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Rating created successfully',
    data: result,
  });
});


const RatingController = {
  createRating,
}

export default RatingController