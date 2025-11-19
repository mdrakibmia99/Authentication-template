import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join((process.cwd(), '.env')) });

const aws = {
  accessKeyId: process.env.S3_BUCKET_ACCESS_KEY,
  secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  bucket: process.env.AWS_BUCKET_NAME,
};
const cloudinary = {
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
}
const stripe = {
  stripe_api_key: process.env.STRIPE_API_KEY,
  stripe_api_secret: process.env.STRIPE_API_SECRET,
};
const twilio = {
  account_sid: process.env.TWILIO_ACCOUNT_SID,
  auth_token: process.env.TWILIO_AUTH_TOKEN,
  phone_number: process.env.TWILIO_PHONE_NUMBER,
}

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  ip: process.env.IP,
  admin_email: process.env.ADMIN_EMAIL,
  admin_password: process.env.ADMIN_PASSWORD,
  admin_phone: process.env.ADMIN_PHONE,
  database_url: process.env.DATABASE_URL,
  server_url: process.env.SERVER_URL,
  client_Url: process.env.CLIENT_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,

  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,

  create_user_secret: process.env.CREATE_USER_SECRET,
  create_user_expire_time: process.env.CREATE_USER_EXPIRE_TIME,
  
  forget_jwt_secret: process.env.FORGET_JWT_SECRET,
  forget_expire_time: process.env.FORGET_EXPIRE_TIME,
  
  otp_jwt_secret: process.env.OTP_JWT_SECRET,
  otp_token_expire_time: process.env.OTP_TOKEN_EXPIRE_TIME,

  nodemailer_host_email: process.env.NODEMAILER_HOST_EMAIL,
  nodemailer_host_pass: process.env.NODEMAILER_HOST_PASS,
  twilio_account_sid: process.env.TWILIO_ACCOUNT_SID,
  twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
  twilio_phone_number: process.env.TWILIO_PHONE_NUMBER,
  // otp_expire_time: process.env.OTP_EXPIRE_TIME,
  socket_port: process.env.SOCKET_PORT,
  CLIENT_CORS_ORIGIN: process.env.CLIENT_CORS_ORIGIN,
  google_map_api_key: process.env.GOOGLE_MAP_API_KEY,
  MAX_DISTANCE: process.env.MAX_DISTANCE,


  cloudinary,
  aws,
  stripe,
  twilio
};
