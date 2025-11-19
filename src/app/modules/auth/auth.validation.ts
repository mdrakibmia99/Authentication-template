import { z } from 'zod';

const loginZodValidationSchema = z.object({
  body: z.object({
    email: z.string().nonempty({ message: 'Email is required!' }),
    password: z.string().nonempty({ message: 'Password is required!' }),
  }),
});
const googleLoginValidationSchema = z.object({
  body: z.object({
    accessToken: z.string().nonempty({ message: 'Access Token is required!' }),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().nonempty({ message: 'Refresh token is required!' }),
  }),
});

const forgetPasswordValidationSchemaByEmail = z.object({
  body: z.object({
    email: z.string().nonempty({ message: 'Email is required!' }),
  }),
});

const forgetPasswordValidationSchemaByNumber = z.object({
  body: z.object({
    phoneNumber: z.string().nonempty({ message: 'phoneNumber is required!' }),
  }),
});

const otpMatchValidationSchema = z.object({
  body: z.object({
    otp: z.string().nonempty({ message: 'Otp is required!' }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    newPassword: z.string().nonempty({ message: 'New Password is required!' }),
    confirmPassword: z.string().nonempty({ message: 'Confirm Password is required!' }),
  }),
});

export const authValidation = {
  loginZodValidationSchema,
  googleLoginValidationSchema,
  refreshTokenValidationSchema,
  forgetPasswordValidationSchemaByEmail,
  forgetPasswordValidationSchemaByNumber,
  otpMatchValidationSchema,
  resetPasswordValidationSchema,
};
