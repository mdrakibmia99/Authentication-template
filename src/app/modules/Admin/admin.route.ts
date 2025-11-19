import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { adminController } from "./admin.controller";

export const adminRoutes = Router();

adminRoutes
    .patch('/block/:id', auth(USER_ROLE.ADMIN), adminController.blockedUser)
    .delete('/delete/:id', auth(USER_ROLE.ADMIN), adminController.deleteUser)
    
