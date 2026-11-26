import { NextFunction,Response,Request } from "express";
import ApiError from "../utils/ApiError.js";

const errorHandler=(err:Error,_req:Request,res:Response,_next:NextFunction)=>{
    // console.log(err);
    const statusCode=err instanceof ApiError ? err.statusCode : 500;
    res.status(statusCode).json({
        success:false,
        message:err instanceof ApiError ? err.message : "Internal Server Error"
    })
}

export default errorHandler;