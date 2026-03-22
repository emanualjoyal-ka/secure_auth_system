import { NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";


export interface AuthRequest extends Request{
    user?:any;
}

export const authenticate=async (req:AuthRequest,res:Response,next:NextFunction)=>{
    try {
        //get accessToken from cookie
        const token=req.cookies.accessToken;
        if(!token){
            return res.status(401).json({success:false,error:"No access token"});
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET!) as {id:string,role:string};
        
        const user=await userModel.findById(decoded.id).select("-password");
        
        if(!user){
            return res.status(401).json({success:false,error:"User not found"});
        }

        //attatch user to request
        req.user=user;

        next();

    } catch (error) {
        return res.status(401).json({success:false,error:"Invalid or expired token"});
    }
}