import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/generateToken.js";
import sessionModel from "../models/session.model.js";
import userModel from "../models/user.model.js";


declare global {
  namespace Express { 
    interface Request {
      user?: {
        userId: string;
        token_id: string;
        role:string;
        tokenVersion: number;
      };
    }
  }
}
 

export const authenticate=async(req: Request,_res: Response,next: NextFunction)=> {
    const token = req.cookies.accessToken
    if(!token) throw new ApiError("Access token is required",401);
    const payload = verifyAccessToken(token);
    const user = await userModel.findById(payload.userId);
    if (!user) throw new ApiError("Unauthorized", 401);
    if (payload.tokenVersion !== user.tokenVersion) throw new ApiError("Session expired. Please login again.", 401);
    const session = await sessionModel.findOne({
        userId: user._id,
        token_id: payload.token_id,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    })
    if (!session) throw new ApiError("Session expired", 401);
    req.user = {
      userId: user._id.toString(),
      token_id:payload.token_id,
      role: user.role,
      tokenVersion: user.tokenVersion
    };
    next();
}