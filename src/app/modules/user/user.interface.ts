import { IAddress } from '../../interface/common.interface';
import { LOGIN_WITH_INTERFACE } from '../auth/auth.constant';
import { USER_ROLE_INTERFACE } from './user.constants';
import { HydratedDocument, Model, Schema } from 'mongoose';

export interface TDrivingLicense {
  drivingLicenseCountry: string;
  drivingLicenseFirstName: string;
  drivingLicenseLastName: string;
  drivingLicenseNumber: string;
  drivingLicenseDOB: Date | null;
  drivingLicenseExpiryDate: Date | null;
  drivingLicenseImage: string[];
}

export interface TCompanyDetails {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyImage: string[];
}

export interface TUserCreate {
  fullName?: string;
  email: string;
  password: string;
  role: USER_ROLE_INTERFACE;
  bio?: string;
  profileImage?: string;
  isBlocked?: boolean;
  isDeleted?: boolean;
  passwordChangedAt?: Date | null;
  loginWth?: LOGIN_WITH_INTERFACE;
}

export interface TUser extends TUserCreate {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeleteAccountPayload {
  password: string;
}

export interface UserModel extends Model<TUser> {
  isUserExist(email: string): Promise<TUser>;

  isUserActive(email: string): Promise<TUser>;

  IsUserExistById(id: string): Promise<HydratedDocument<TUser> | null>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}

export type IPaginationOption = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};


export enum Category {
  DRIVER = 'Driver section',
  PASSENGER = 'Passenger section',
  EARNING = 'Earning section',
}
export type CategoryType = `${Category}`;