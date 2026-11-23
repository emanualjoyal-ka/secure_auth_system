import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/generateToken.js";
import sessionModel from "../models/session.model.js";


declare global {
  namespace Express { 
    interface Request {
      user?: {
        userId: string;
        token_id: string;
        role:string
      };
    }
  }
}


export const authenticate=async(req: Request,_res: Response,next: NextFunction)=> {
    const token = req.cookies.accessToken
    if(!token) throw new ApiError("Access token is required",401);
    const payload = verifyAccessToken(token);
    const session = await sessionModel.findOne({token_id:payload.token_id})
    if (!session || session.isRevoked || session.expiresAt < new Date()) throw new ApiError("Session expired", 401);
    req.user = {
      userId: payload.userId,
      token_id:payload.token_id,
      role: payload.role
    };
    next();
}