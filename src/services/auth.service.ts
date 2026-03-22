import sessionModel from "../models/session.model.js";
import userModel from "../models/user.model.js"
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

//creating user
export const createUser=async (name:string,email:string,password:string)=>{
    const userExists=await userModel.findOne({email});

    if(userExists){
        throw new Error("User already exists")
    }

    const user=await userModel.create({
        name:name,
        email:email,
        password:password
    });

    return user;
}

//user login
export const loginUser=async (email:string,password:string,userAgent:string,ip:string)=>{
    const user=await userModel.findOne({email}).select("+password");
    if(!user){
        throw new Error("User not found");
    }

    const isMatch=await user.comparePassword(password);
    if(!isMatch){
        throw new Error("Invalid password")
    }

    const accessToken=generateAccessToken(user._id.toString(),user.role);
    const refreshToken=generateRefreshToken(user._id.toString());

    await sessionModel.create({
        userId:user._id,
        refreshToken:refreshToken,
        userAgent:userAgent,
        ip:ip,
        expiresAt:new Date(Date.now()+7*24*60*60*1000)
    })

    return {user,accessToken,refreshToken};
}


//logout
export const logoutUser=async (refreshToken:string)=>{
    const decoded=jwt.verify(refreshToken,process.env.REFRESH_TOKEN!) as {id:string};

    //find sessions
    const sessions=await sessionModel.find({userId:decoded.id,isValid:true});

    for(const session of sessions){
        const isMatch=await bcrypt.compare(refreshToken,session.refreshToken);
        if(isMatch){
            session.isValid=false;
            await session.save();
            return;
        }
    }

    throw new Error("Session not found");
}


//logout from all devices
export const logoutAllDevices=async(refreshToken:string)=>{
    const decoded=jwt.verify(refreshToken,process.env.REFRESH_TOKEN!) as {id:string};

    await sessionModel.updateMany({userId:decoded.id},{isValid:false})
}