import sessionModel from "../models/session.model.js";
import userModel from "../models/user.model.js"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/generateToken.js";
import bcrypt from "bcrypt";
import ApiError from "../utils/ApiError.js";
import { userLoginRequest, userLoginResponse } from "../dtos/auth.dto/loginDto.js";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import { userRegisterRequest, userRegisterResponse } from "../dtos/auth.dto/registerDto.js";
import { getUserResponse } from "../dtos/user.dto/getUserDto.js";
import { renewAccessTokenResponse } from "../dtos/auth.dto/refreshTokenDto.js";


export const createUser=async (user:userRegisterRequest):Promise<userRegisterResponse>=>{
    const userExists=await userModel.findOne({email:user.email})
    if(userExists) throw new ApiError("User already exists",409)
    const hashedPasswd=await bcrypt.hash(user.password,10);
    const res=await userModel.create({
        name:user.name,
        email:user.email,
        password:hashedPasswd
    });
    return {
        id:res._id.toString(),
        name:res.name,
        email:res.email,
        role:res.role
    };
}


export const loginUser=async (user:userLoginRequest):Promise<userLoginResponse>=>{
    const userExist=await userModel.findOne({email:user.email})
    if(!userExist) throw new ApiError("Invalid email or password",401);
    const isMatch=await bcrypt.compare(user.password,userExist.password)
    if(!isMatch){
        userExist.loginAttempts += 1;   // increse login attempt when login fails
        if(userExist.loginAttempts >=5) userExist.lockUntil=new Date(Date.now() + 24 * 60 * 60 * 1000) //account blocks for 24 hours after 5 attempts 
        await userExist.save();
        if(userExist.lockUntil && userExist.lockUntil > new Date()) throw new ApiError("Account is locked. Try again later",423)
        throw new ApiError("Invalid password",401)
    }

    userExist.loginAttempts=0;  //resets attempts if login successfull
    userExist.lockUntil=undefined;
    await userExist.save();

    const token_id=uuidv4();

    const accessToken=generateAccessToken({userId:userExist._id.toString(),role:userExist.role,token_id});
    const refreshToken=generateRefreshToken({userId:userExist._id.toString(),token_id});
    const hashedRefreshToken=await bcrypt.hash(refreshToken,10)

    await sessionModel.create({
        userId:userExist._id,
        refreshToken:hashedRefreshToken,
        token_id,
        userAgent:user.userAgent,
        ip:user.ip,
        expiresAt:new Date(Date.now()+7*24*60*60*1000)
    })

    return {
        user:{
            name:userExist.name,
            email:userExist.email,
            role:userExist.role
        },
        accessToken,
        refreshToken
    };
}


export const currentUser=async(userId:string):Promise<getUserResponse>=>{
        const user_id=new mongoose.Types.ObjectId(userId)
        const user=await userModel.findById(user_id)
        if(!user) throw new ApiError("user not found",404)
        return {
            id:user.id,
            name:user.name,
            email:user.email,
            role:user.role
        }
}


export const handlerefreshtoken=async(token:string):Promise<renewAccessTokenResponse>=>{
    if(!token) throw new ApiError("No refresh token provided",401)
    const decoded=verifyRefreshToken(token)
     const sessions=await sessionModel.find({userId:decoded.userId,isRevoked:false});
     let validSession=null;
     //compare hashed tokens
     for(const session of sessions){
        const isMatch=await bcrypt.compare(token,session.refreshToken);
        if(isMatch){
            validSession=session;
            break;
        }
     }
     //refreshtoken resue detection, If old token is reused, someone stole it
     if(!validSession){
        await sessionModel.updateMany({userId:decoded.userId},{$set:{isRevoked:true}});
        throw new ApiError("Suspicious activity detected. Logged out from all devices",401)
     }
     if(validSession.expiresAt<new Date()){
        validSession.isRevoked=true;
        await validSession.save();
        throw new ApiError("Sessionn expired",401);
     }

     const user=await userModel.findById(decoded.userId);
     if(!user) throw new ApiError("User not found",404);
     
    const newTokenId=uuidv4()
     //Refresh token rotation : when /refresh is called after accesstoken expires, new refreshtoken is also generated and stored, thus increses security
     //generate new refreshtoken
     const newRefreshToken=generateRefreshToken({userId:user._id.toString(),token_id:newTokenId,});
     const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken,10);
     validSession.refreshToken=hashedNewRefreshToken;
     validSession.expiresAt=new Date(Date.now()+7*24*60*60*1000);
     await validSession.save();
     //generate new accessToken
     const newAccessToken=generateAccessToken({userId:user._id.toString(),role:user.role,token_id:newTokenId});
     return {name:user.name,email:user.email,newAccessToken, newRefreshToken};
}


export const logoutUser=async (refreshToken:string):Promise<void>=>{
    if(!refreshToken) throw new ApiError("No refresh token provided",400)
    const decoded=verifyRefreshToken(refreshToken);
    const sessions=await sessionModel.find({userId:decoded.userId,token_id: decoded.token_id,isRevoked:false});
    for(const session of sessions){
        const isMatch=await bcrypt.compare(refreshToken,session.refreshToken);
         console.log({
            sessionId: session._id,
            tokenId: session.token_id,
            isMatch
        });
        if(isMatch){
            session.isRevoked=true;
            await session.save();
            return;
        }
    }
    throw new ApiError("Session not found",404);
}


//logout from all devices
export const logoutAllDevices=async(refreshToken:string):Promise<void>=>{
    if(!refreshToken) throw new ApiError("No refresh token provided",400)
    const decoded=verifyRefreshToken(refreshToken);
    await sessionModel.updateMany({userId:decoded.userId,isRevoked: false},{$set:{isRevoked:true}})
}

//logout from specific device
export const logoutSession=async (userId:string|undefined,sessionId:string):Promise<void>=>{
    if (!userId) throw new ApiError("Unauthorized", 401);
    if (!sessionId) throw new ApiError("SessionId is required", 400);
    const session = await sessionModel.findOne({_id: sessionId,userId,isRevoked: false});
    if(!session) throw new ApiError("Session not found",404);
    session.isRevoked=true;
    await session.save();
}


//change password only after login
export const changeUserPassword=async(userId:string|undefined,currentPassword:string,newPassword:string):Promise<void>=>{
     if (!userId) throw new ApiError("Unauthorized", 401);
    const user=await userModel.findById(userId);
    if(!user) throw new ApiError("User not found",404);
    const isMatch=await bcrypt.compare(currentPassword,user.password);
    if(!isMatch) throw new ApiError("Current password is incorrect",400)
    //checks if current and new passwords are same
    const isSame=await bcrypt.compare(newPassword,user.password)
    if(isSame) throw new ApiError("New password cannot be same as previous password",400);
    const hashedPasswd = await bcrypt.hash(newPassword, 10);
    user.password=hashedPasswd;
    await user.save();
    //invalidate all sessions
    await sessionModel.updateMany({userId:user._id,isRevoked:false},{$set:{isRevoked:true}})
}