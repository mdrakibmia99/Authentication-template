import { z } from 'zod';

const verifyOtpZodSchema = z.object({
  body: z.object({
    otp: z
      .string()
      .nonempty({ message: 'otp is required' }) // required check
      .length(4, { message: 'otp must be exactly 6 characters long' }), // length check
  }),
});

export const resentOtpValidations = {
  verifyOtpZodSchema,
};
