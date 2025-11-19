import { z } from 'zod';
import { USER_ROLE } from './user.constants';

const userValidationSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .min(1, { message: 'Full name is required' })
      .optional(),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    email: z.string().email({ message: 'Invalid email format' }),
    role: z.enum([USER_ROLE.USER, USER_ROLE.VENDOR], { message: 'Role must be either guest or host' }),
  }),
});
const updateProfileValidationSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .min(1, { message: 'Full name is required' })
      .optional(),
    bio: z.string().optional(),


  }),
});


const drivingLicenseZodSchema = z.object({
  body: z.object({
    country: z.string()
      .min(1, "Driving license country is required"),

    firstName: z.string()
      .min(1, "First name on driving license is required"),

    lastName: z.string()
      .min(1, "Last name on driving license is required"),

    licenseNumber: z.string()
      .min(1, "Driving license number is required"),

    dob: z.preprocess(
      (val) => val ? new Date(val as string) : null,
      z.date().nullable().refine(
        (val) => val === null || val instanceof Date && !isNaN(val.getTime()),
        { message: "Date of birth must be a valid date" }
      )
    ),

    expiryDate: z.preprocess(
      (val) => val ? new Date(val as string) : null,
      z.date().nullable().refine(
        (val) => val === null || val instanceof Date && !isNaN(val.getTime()),
        { message: "Expiry date must be a valid date" }
      )
    ),
  }),
});
const updateDrivingLicenseZodSchema = z.object({
  body: z.object({
    country: z.string()
      .min(1, "Driving license country is required").optional(),

    firstName: z.string()
      .min(1, "First name on driving license is required").optional(),

    lastName: z.string()
      .min(1, "Last name on driving license is required").optional(),

    licenseNumber: z.string()
      .min(1, "Driving license number is required").optional(),

    dob: z.preprocess(
      (val) => val ? new Date(val as string) : null,
      z.date().nullable().refine(
        (val) => val === null || val instanceof Date && !isNaN(val.getTime()),
        { message: "Date of birth must be a valid date" }
      )
    ).optional(),

    expiryDate: z.preprocess(
      (val) => val ? new Date(val as string) : null,
      z.date().nullable().refine(
        (val) => val === null || val instanceof Date && !isNaN(val.getTime()),
        { message: "Expiry date must be a valid date" }
      )
    ).optional(),
  }),
});
const companyDetailsZodSchema = z.object({
  body: z.object({
    companyName: z.string()
      .min(1, "Company name is required"),

    companyAddress: z.string()
      .min(1, "Company address is required"),

    permitNumber: z.string()
      .min(1, "Permit number is required"),

    businessRegistrationNumber: z.string()
      .min(1, "Business registration number is required"),

  }),
});
const updateCompanyDetailsZodSchema = z.object({
  body: z.object({
    companyName: z.string().optional(),
    companyAddress: z.string().min(1, "Company address is required").optional(),
    permitNumber: z.string().min(1, "Permit number is required").optional(),
    businessRegistrationNumber: z.string().min(1, "Business registration number is required").optional(),

  }),
});


export const userValidation = {
  userValidationSchema,
  updateProfileValidationSchema,
  drivingLicenseZodSchema,
  updateDrivingLicenseZodSchema,
  companyDetailsZodSchema,
  updateCompanyDetailsZodSchema,
};
