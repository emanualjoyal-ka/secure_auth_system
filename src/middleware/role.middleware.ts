import type { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError.js";

export enum UserRole{
    ADMIN="admin",
    USER="user"
}

export const authorize=(...allowedRoles:UserRole[])=>{ 
    return (req:Request,_res:Response,next:NextFunction)=>{
        if(!req.user){
            throw new ApiError("Unauthorized",401)
        }
        if(!allowedRoles.includes(req.user.role as UserRole)){
            throw new ApiError("Forbidden",403)
        }
        next();
    }
}