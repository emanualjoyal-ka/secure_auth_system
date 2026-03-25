import { NextFunction, Request, Response} from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import userModel from "../models/user.model.js";


export interface AuthRequest extends Request{
    user?:any;
}

interface CustomJwtPayload extends JwtPayload{ //jwtpayload to include iat which create when token is generated
    id:string;
    role:string;
}

export const authenticate=async (req:AuthRequest,res:Response,next:NextFunction)=>{
    try {
        //get accessToken from cookie
        const token=req.cookies.accessToken;
        if(!token){
            return res.status(401).json({success:false,error:"No access token"});
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET!) as CustomJwtPayload;
        
        const user=await userModel.findById(decoded.id).select("-password");
        
        if(!user){
            return res.status(401).json({success:false,error:"User not found"});
        }

        if(user.passwordChangedAt && decoded.iat){ //when password change, jwt becomes useless
            const tokenIssuedAt=decoded.iat*1000;
            if(tokenIssuedAt < user.passwordChangedAt.getTime()){
                return res.status(401).json({message:"Token invalid due to password change"})
            }
        }

        //attatch user to request
        req.user=user;

        next();

    } catch (error) {
        return res.status(401).json({success:false,error:"Invalid or expired token"});
    }
}