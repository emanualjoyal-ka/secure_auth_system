import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import ApiError from "./ApiError.js";

export interface AccessTokenPayload {
  userId: string;
  role: string;
  token_id:string;
}

export interface RefreshTokenPayload {
  userId: string;
  token_id:string;
}


export const generateAccessToken=(
  payload:AccessTokenPayload
)=>{
  return jwt.sign(
    payload,
    env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    }
  );
}


export const generateRefreshToken=(payload:RefreshTokenPayload)=>{
  return jwt.sign(
    payload,
    env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    }
  );
}


export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token,env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
  } catch (error) {
     if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      throw new ApiError("Invalid or expired access token", 401);
    }
    throw error
  }
  };


export const verifyRefreshToken =(token: string) => {
    try {
      return jwt.verify(token,env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      throw new ApiError("Invalid or expired refresh token", 401);
    }
    throw error;
    }
  };