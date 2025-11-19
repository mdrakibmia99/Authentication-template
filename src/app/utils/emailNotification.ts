import { sendEmail } from "./mailSender";



interface OtpSendEmailParams {
  sentTo: string;
  subject: string;
  name: string;
  otp: string | number;
  expiredAt: string;
}

const otpSendEmail = async ({
  sentTo,
  subject,
  name,
  otp,
  expiredAt,
}: OtpSendEmailParams): Promise<void> => {
  await sendEmail(
    sentTo,
    subject,
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
       <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
       <h2 style="color: #4CAF50;">Your One Time OTP</h2>
        <p style="font-size: 16px;">Your OTP is: <strong>${otp}</strong></p>
        <p style="font-size: 14px; color: #666;"> This OTP is valid for <strong>3 minutes</strong>.</p>
      </div>
    </div>`,
  );
};

export { otpSendEmail };
