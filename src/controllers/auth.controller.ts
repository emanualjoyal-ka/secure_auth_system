import {Request, Response} from "express";
import { changeUserPassword, createUser, currentUser, getAllSessions, handlerefreshtoken, loginUser, logoutAllDevices, logoutSession, logoutUser } from "../services/auth.service.js";
import { sendResponse } from "../utils/ApiResponse.js";
import { accessCookieOptions, clearAuthCookies, refreshCookieOptions } from "../utils/cookie.js";


export const registerUser=async(req:Request,res:Response)=>{
        const user=await createUser(req.body);
        return sendResponse(res,{
            statusCode:201,
            message:"User created successfully",
            data:user
        })
}

export const userLogin=async (req:Request,res:Response)=>{
        const input={
            email:req.body.email,
            password:req.body.password,
            userAgent:req.get("User-Agent") || "",
            ip:req.ip || "0.0.0.0"
        }
        const {user,accessToken,refreshToken}=await loginUser(input);
        res.cookie("accessToken",accessToken,accessCookieOptions)
        res.cookie("refreshToken",refreshToken,refreshCookieOptions)
        return sendResponse(res,{
            statusCode:200,
            message:"Logged in successfully",
            data:user
        })
}

export const getUser=async(req:Request,res:Response)=>{
    const id=req.user!.userId;
    const user=await currentUser(id)
    return sendResponse(res,{
        statusCode:200,
        data:user
    })
}


export const refreshTokenController=async(req:Request,res:Response)=>{
     const token=req.cookies?.refreshToken;
     const {newAccessToken, newRefreshToken,...user}=await handlerefreshtoken(token);
     res.cookie("refreshToken",newRefreshToken,refreshCookieOptions)
     res.cookie("accessToken",newAccessToken,accessCookieOptions)
     return sendResponse(res,{
        statusCode:200,
        data:user
     })
}


export const logout=async(req:Request,res:Response)=>{
    const token=req.cookies?.refreshToken;
    if(token) await logoutUser(token);
    clearAuthCookies(res)
    return sendResponse(res,{
        statusCode:200,
        message:"Logged out successfully"
    })
}

//logout from all devices
export const allDeviceLogout=async(req:Request,res:Response)=>{
        const token=req.cookies?.refreshToken;
        if(token) await logoutAllDevices(token);
        clearAuthCookies(res);
        return sendResponse(res,{
            statusCode:200,
            message:"Successfully logged out from all devices"
        })
}


//logout specific device
export const logoutDevice=async (req:Request,res:Response)=>{
        const {sessionId}=req.params;
        const userId=req.user?.userId;
        await logoutSession(userId,sessionId);
        return sendResponse(res,{
            statusCode:200,
            message:"Logged out from device successfully"
        })
}

// get all sessions of authenticated user
export const getSessions=async(req:Request,res:Response)=>{
    const userId=req.user!.userId;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 5);
    const data=await getAllSessions(userId,page,limit);
    return sendResponse(res,{
        statusCode:200,
        data
    })
}

//change password after login
export const changePassword=async (req:Request,res:Response)=>{
        const userId=req.user?.userId;
        const {currentPassword,newPassword}=req.body;
        await changeUserPassword(userId,currentPassword,newPassword);
        clearAuthCookies(res);
        return sendResponse(res,{
            statusCode:200,
            message:"Password Changed,please login again"
        })
}