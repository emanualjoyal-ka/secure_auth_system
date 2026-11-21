import sessionModel from "../models/session.model.js";
import userModel from "../models/user.model.js"
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { userRequestDto } from "../dtos/auth.dto/userRequestDto.js";
import { userResponseDto } from "../dtos/auth.dto/userResponseDto.js";
import { authRepository } from "../repository/auth.repository.js";
import ApiError from "../utils/ApiError.js";
import { userLoginRequest } from "../dtos/auth.dto/loginDto.js";


export const createUser=async (user:userRequestDto):Promise<userResponseDto>=>{
    const userExists=await authRepository.getUser(user.email)
    if(userExists) throw new ApiError("User already exists",409)
    const hashedPasswd=await bcrypt.hash(user.password,10);
    const userData:userRequestDto = {
        name: user.name,
        email: user.email,
        password: hashedPasswd,
    };
    const res=await authRepository.createUser(userData)
    return {
        id:res._id.toString(),
        name:res.name,
        email:res.email,
        role:res.role
    };
}


export const loginUser=async (user:userLoginRequest)=>{
    const userExist=await authRepository.getUser(user.email)
    if(!userExist) throw new ApiError("Invalid email or password",404);
    const isMatch=await bcrypt.compare(user.password,userExist.password)
    if(!isMatch){
        userExist.loginAttempts += 1;   // increse login attempt when login fails
        if(userExist.loginAttempts >=5){ // if 5 or more attempts
            userExist.lockUntil=new Date(Date.now() + 24 * 60 * 60 * 1000) //account blocked for 24 hours
        }
        await userExist.save();
        if(userExist.lockUntil && userExist.lockUntil > new Date()){
            throw new Error ("Account is locked. Try again later")
        }
        throw new Error("Invalid password")
    }

    userExist.loginAttempts=0;  //resets attempts if login successfull
    userExist.lockUntil=undefined;
    await userExist.save();

    const accessToken=generateAccessToken(userExist._id.toString(),userExist.role);
    const refreshToken=generateRefreshToken(userExist._id.toString());

    await sessionModel.create({
        userId:userExist._id,
        refreshToken:refreshToken,
        userAgent:user.userAgent,
        ip:user.ip,
        expiresAt:new Date(Date.now()+7*24*60*60*1000)
    })

    return {user,accessToken,refreshToken};
}


//handelrefreshtoken
export const handlerefreshtoken=async(token:string)=>{
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

     //refreshtoken resue detection, If old token is reused → someone stole it
     if(!validSession){
        await sessionModel.updateMany({userId:decoded.id},{isValid:false});
        throw new Error("Suspicious activity detected. Logged out from all devices")
     }

     if(validSession.expiresAt<new Date()){
        validSession.isValid=false;
        await validSession.save();

        throw new Error("Sessionn expired");
     }

     const user=await userModel.findById(decoded.id);

     if(!user){
        throw new Error("User not found");
     }

     //Refresh token rotation : when /refresh is called after accesstoken expires, new refreshtoken is also generated and stored, thus increses security
     //generate new refreshtoken
     const newRefreshToken=generateRefreshToken(user._id.toString());

     validSession.refreshToken=newRefreshToken;
     validSession.expiresAt=new Date(Date.now()+7*24*60*60*1000);
     await validSession.save();

     //generate new accessToken
     const newAccessToken=generateAccessToken(user._id.toString(),user.role);

     return {newAccessToken, newRefreshToken};

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

//logout from specific device
export const logoutSession=async (userId:string,sessionId:string)=>{
    const session=await sessionModel.findById(sessionId);

    if(!session){
        throw new Error("Session not found");
    }

    if(session.userId.toString() !== userId){
        throw new Error("Unauthorized")
    }

    session.isValid=false;
    await session.save();

    return session;
}


//change password only after login
export const changeUserPassword=async(userId:string,currentPassword:string,newPassword:string)=>{
    const user=await userModel.findById(userId).select("+password");

    if(!user){
        throw new Error("User not found");
    }

    const isMatch=await bcrypt.compare(user.password,currentPassword);

    //checks current password
    if(!isMatch){
        throw new Error("Current password is incorrect")
    }

    //checks if current and new passwords are same
    const isSame=await bcrypt.compare(user.password,newPassword)
    if(isSame){
        throw new Error("New password cannot be same as previous password");
    }

    user.password=newPassword; //assigning new password
    await user.save();

    //invalidate all sessions
    await sessionModel.updateMany({userId:userId},{isValid:false})
}