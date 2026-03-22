import {Request, Response} from "express";
import { registerValidation } from "../validations/auth.validation.js";
import { createUser, loginUser, logoutAllDevices, logoutUser } from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import bcrypt from "bcrypt";


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

     //verify refresh token coming from client
     const decoded=jwt.verify(token,process.env.REFRESH_TOKEN!) as {id:string};

     //find all active sessions
     const sessions=await sessionModel.find({userId:decoded.id,isValid:true});
    
     let validSession=null;

     //compare hashed tokens
     for(const session of sessions){
        const isMatch=await bcrypt.compare(token,session.refreshToken);

        if(isMatch){
            validSession=session;
            break;
        }
     }

     if(!validSession){
        return res.status(403).json({success:false,error:"Invalid session"});
     }

     if(validSession.expiresAt<new Date()){
        validSession.isValid=false;
        await validSession.save();

        return res.status(403).json({success:false,error:"Sessionn expired"});
     }

     const user=await userModel.findById(decoded.id);

     if(!user){
        return res.status(404).json({success:false,error:"User not found"});
     }

     //Refresh token rotation : when /refresh is called after accesstoken expires, new refreshtoken is also generated and stored, thus increses security
     //generate new refreshtoken
     const newRefreshToken=generateRefreshToken(user._id.toString());

     validSession.refreshToken=newRefreshToken;
     validSession.expiresAt=new Date(Date.now()+7*24*60*60*1000);
     await validSession.save();

     res.cookie("refreshToken",newRefreshToken,{
        httpOnly:true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
     })


     //generate new accessToken
     const newAccessToken=generateAccessToken(user._id.toString(),user.role);

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