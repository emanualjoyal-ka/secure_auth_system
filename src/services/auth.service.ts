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
        user.loginAttempts += 1;   // increse logon attempt when login fails
        if(user.loginAttempts >=5){ // if 5 or more attempts
            user.lockUntil=new Date(Date.now() + 24 * 60 * 60 * 1000) //account blocked for 24 hours
            throw new Error("You have been locked out, try agein later");
        }
        await user.save();
        throw new Error("Invalid password")
    }

    user.loginAttempts=0;  //resets attempts if login successfull
    user.lockUntil=undefined;
    await user.save();

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