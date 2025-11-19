import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import RatingController from "./rating.controller";



export const RatingRoutes = Router();

RatingRoutes.post('/create-rating', auth(USER_ROLE.USER, USER_ROLE.VENDOR), RatingController.createRating)



