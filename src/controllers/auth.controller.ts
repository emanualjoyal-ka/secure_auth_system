import {Request, Response} from "express";
import { registerValidation } from "../validations/auth.validation.js";
import { changeUserPassword, createUser, handlerefreshtoken, loginUser, logoutAllDevices, logoutSession, logoutUser } from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { changePasswordValidation } from "../validations/changePassword.validation.js";

//register user
export const registerUser=async(req:Request,res:Response)=>{
    try {
        const {error}=registerValidation.validate(req.body);
        if(error){
            return res.status(400).json({message:error.details[0]?.message});
        }

        const {name, email, password}=req.body;
        const user=await createUser(name,email,password);

        res.status(201).json({success:true,data:user});

    } catch (error) {
        if(error instanceof Error){
            return res.status(400).json({success:false,error:error.message});
        }
        res.status(500).json({success:false,error:"SERVER ERROR"});
    }
}


//user login
export const userLogin=async (req:Request,res:Response)=>{
    try {
        const {email, password}=req.body;

        const userAgent=req.get("User-Agent") || "";
        const ip=req.ip || "0.0.0.0";

        const {user,accessToken,refreshToken}=await loginUser(email,password,userAgent,ip);

        res.cookie("accessToken",accessToken,{
            httpOnly:true,  //cannot access from java script
            secure:process.env.NODE_ENV === "production", //https only in production
            sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge:15*60*1000
        })

        res.cookie("refreshToken",refreshToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge:7*24*60*60*1000
        })

        res.status(200).json({success:true,data:user,message:"Logged in successfully"})

    } catch (error:unknown) {
        if(error instanceof Error){
            return res.status(400).json({success:false,error:error.message});
        }
        res.status(500).json({success:false,error:"SERVER ERROR"})
    }
}


//refresh token
export const refreshTokenController=async(req:Request,res:Response)=>{
   try {
     const token=req.cookies.refreshToken;
     if(!token){
        return res.status(401).json({success:false,error:"No Refresh token"})
     }

     const {newAccessToken, newRefreshToken}=await handlerefreshtoken(token);
   
     res.cookie("refreshToken",newRefreshToken,{
        httpOnly:true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
     })

     res.cookie("accessToken",newAccessToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge:15*60*1000
     })

     res.json({success:true})

   } catch (error:unknown) {

        if(error instanceof jwt.JsonWebTokenError){
            return res.status(403).json({success:false,error:"Invalid refresh token"})
        }

         if(error instanceof Error){
            return res.status(400).json({success:false,error:error.message});
        }
        res.status(500).json({success:false,error:"SERVER ERROR"})
   } 
   
}


//logout
export const logout=async(req:Request,res:Response)=>{
    try {
          const token=req.cookies.refreshToken;
    if(token){
        await logoutUser(token);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({success:true,message:"logged out successfully"});
    } catch (error) {
        return res.status(500).json({success:false,error:"SERVER ERROR"})
    }
}

//logout from all devices
export const allDeviceLogout=async(req:Request,res:Response)=>{
    try {
        const token=req.cookies.refreshToken;
        if(token){
            await logoutAllDevices(token);
        }
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({success:true,message:"Successfully logged out from all devices"})
    } catch (error) {
        res.status(500).json({success:false,error:"SERVER ERROR"})
    }
}


//logout specific device
export const logoutDevice=async (req:AuthRequest,res:Response)=>{
    try {
        const {sessionId}=req.body;
        const userId=req.user.id;

        if(!sessionId){
            return res.status(400).json({success:false,error:"SessionId is required"})
        }

        await logoutSession(userId,sessionId);

        res.json({success:true})
    } catch (error:unknown) {
        res.status(500).json({success:false,error:"SERVER ERROR"});
    }
}

//change password after login
export const changePassword=async (req:AuthRequest,res:Response)=>{
    try {
        const userId=req.user.id;

        const {error}=changePasswordValidation.validate(req.body); //Joi validation

        if(error){
            return res.status(400).json({success:false,error:error.details[0]?.message});
        }

        const {currentPassword,newPassword}=req.body;
        if(!currentPassword || !newPassword){
            return res.status(400).json({success:false,error:"All fields are required"})
        }

        await changeUserPassword(userId,currentPassword,newPassword);

        //clear cookies, force login
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({success:true,message:"Password Changed,please login again"});
    } catch (error:unknown) {
        if(error instanceof Error){
            return res.status(400).json({success:false,error:error.message})
        }

        res.status(500).json({success:false,error:"SERVER ERROR"});
    }
}