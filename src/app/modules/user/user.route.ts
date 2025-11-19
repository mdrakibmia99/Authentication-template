import { Router } from 'express';
import auth from '../../middleware/auth';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
import { resentOtpValidations } from '../otp/otp.validation';
import { userController } from './user.controller';
import { userValidation } from './user.validation';
import { USER_ROLE } from './user.constants';
const upload = fileUpload('./public/uploads/profile');
export const userRoutes = Router();
// const uploadLicense = fileUpload('./public/uploads/drivingLicense');

userRoutes
  .post(
    '/create',
    validateRequest(userValidation?.userValidationSchema),
    userController.createUser,
  )
  .post(
    '/create-user-verify-otp',
    validateRequest(resentOtpValidations.verifyOtpZodSchema),
    userController.userCreateVerification,
  )
  .delete(
    '/delete-my-account',
    auth(USER_ROLE.USER),
    userController.deleteMyAccount,
  )
userRoutes.get(
  '/get-my-profile',
  auth(USER_ROLE.USER, USER_ROLE.VENDOR, USER_ROLE.ADMIN),
  userController.getMyProfile,
);
userRoutes.patch(
  '/update-my-profile',
  auth(USER_ROLE.USER, USER_ROLE.VENDOR, USER_ROLE.ADMIN),
  upload.single('image'),
  parseData(),
  validateRequest(userValidation?.updateProfileValidationSchema),
  userController.updateMyProfile,
)

