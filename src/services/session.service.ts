import { Types } from "mongoose";
import sessionModel from "../models/session.model.js";

//gets all active sessions of logged in user
export const fetchUserSessions=async (userId:Types.ObjectId,page:number=1,limit:number=10)=>{

    const skip=(page-1)*limit;

    const sessions=await sessionModel.find({
        userId:userId,
        isValid:true
    }).sort({updatedAt:-1}) //sort by last session
    .skip(skip)
    .limit(limit)
    .select("_id userAgent ip createdAt updatedAt expiresAt"); //didnt took refreshtoken

    return sessions;
}

