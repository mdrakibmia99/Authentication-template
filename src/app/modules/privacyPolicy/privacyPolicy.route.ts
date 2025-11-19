import { Router } from "express";

import auth from "../../middleware/auth";
import PrivacyPolicyController from "./privacyPolicy.controller";
import { USER_ROLE } from "../user/user.constants";


export const privacyPolicyRoutes = Router();

privacyPolicyRoutes.post('/', auth( USER_ROLE.ADMIN),PrivacyPolicyController.setPrivacyPolicy )
privacyPolicyRoutes.get('/', auth(USER_ROLE.ADMIN, USER_ROLE.PASSENGER,USER_ROLE.DRIVER,), PrivacyPolicyController.getPrivacyPolicy)

