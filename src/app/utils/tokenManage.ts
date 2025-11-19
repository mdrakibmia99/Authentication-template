import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import AppError from '../error/AppError';
import httpStatus from 'http-status';
import { IJwtPayload } from '../modules/auth/auth.interface';

interface CreateTokenParams {
  payload: JwtPayload;
  access_secret: Secret;
  expity_time: string | number;
}

interface VerifyTokenParams {
  token: string;
  access_secret: string;
}

const createToken = ({
  payload,
  access_secret,
  expity_time,
}: CreateTokenParams): string => {
  const token = jwt.sign(payload, access_secret, {
    expiresIn: expity_time,
  } as jwt.SignOptions);

  return token;
};

const verifyToken = ({
  token,
  access_secret,
}: VerifyTokenParams): JwtPayload | IJwtPayload => {
  try {
    return jwt.verify(token, access_secret) as JwtPayload;
  } catch (err) {
    console.error('JWT verification failed:', err);
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized!!');
  }
};

export { createToken, verifyToken };
