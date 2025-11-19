
import { IRating } from "./rating.interface";
import httpStatus from "http-status";
import { IJwtPayload } from "../auth/auth.interface";
import Rating from "./rating.model";
import { PipelineStage, Types } from "mongoose";
import AppError from "../../error/AppError";

const createRating = async (userData: IJwtPayload, payload: IRating) => {
    return { testMode: true, userData }
};






const RatingService = {
    createRating
}

export default RatingService