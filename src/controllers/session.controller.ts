import { AuthRequest } from "../middleware/auth.middleware.js";
import { Response } from "express";
import { fetchUserSessions } from "../services/session.service.js";
import sessionModel from "../models/session.model.js";


//get all active sessions of logged in user
export const getSessions=async (req:AuthRequest,res:Response)=>{
    try {

        const page=parseInt(req.query.page as string) || 1;
        const limit=parseInt(req.query.limit as string) || 10;
        
        const sessions=await fetchUserSessions(req.user._id,page,limit);

        const totalCount=await sessionModel.countDocuments({userId:req.user._id,isValid:true});

        res.json({success:true,page,limit,totalCount,sessions})

    } catch (error:unknown) {
         if (error instanceof Error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: "SERVER ERROR" });
    }
}