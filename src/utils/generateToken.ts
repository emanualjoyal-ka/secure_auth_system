import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import {v4 as uuidv4} from "uuid";

export const JWT_SECRET = process.env.JWT_SECRET || "";
export const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || "5m";
export const REFRESH_TOKEN=process.env.REFRESH_TOKEN || "";
export const REFRESH_TOKEN_EXPIRES=process.env.REFRESH_TOKEN_EXPIRE || "7d";

//generate access token
export const generateAccessToken = (userId: string, role: string) => {
    const tokenId=uuidv4();
  return jwt.sign(
    { id: userId, role: role, jti:tokenId }, //payload
    JWT_SECRET, //secret key
    { expiresIn: ACCESS_TOKEN_EXPIRE as string & jwt.SignOptions["expiresIn"] }, //token expiry
  );
};


//generate refresh token
export const generateRefreshToken=(userId:string)=>{
    return jwt.sign(
        {id:userId},
        REFRESH_TOKEN,
        {expiresIn:REFRESH_TOKEN_EXPIRES as string & jwt.SignOptions["expiresIn"] }
    )
}
