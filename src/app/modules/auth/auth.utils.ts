import config from "../../config";
import { createToken } from "../../utils/tokenManage";
import axios from "axios";
import { IJwtPayload } from "./auth.interface";

export const generateTokens = (jwtPayload: IJwtPayload) => {
  const accessToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.jwt_access_expires_in as string,
  });

  const refreshToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_refresh_secret as string,
    expity_time: config.jwt_refresh_expires_in as string,
  });

  return { accessToken, refreshToken };
};

export const generateAndReturnTokens = (user: any) => {
  const payload: IJwtPayload = {
    userId: user._id.toString(),
    role: user?.role,
    fullName: user?.fullName || null,
    email: user?.email || null,
    phone: user?.phone || null,
    googleId: user?.googleId || null,
  };

  const { accessToken, refreshToken } = generateTokens(payload);

  return { user, accessToken, refreshToken };
};

export const verifyGoogleToken = async (accessToken: string) => {
  console.log(accessToken,"token =>>>>>>>");
  const url = `https://www.googleapis.com/oauth2/v3/userinfo`;
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  // data: { sub, name, email, picture, ... }
  console.log({ data });
  return data;
};