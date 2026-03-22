import { Request, Response } from "express"
import { createUserByAdmin } from "../services/admin.service.js";


export const createUser=async (req:Request,res:Response)=>{
    try {
        const {name,email,password,role}=req.body;

        const user=await createUserByAdmin(name,email,password,role);

        res.status(201).json({success:true,data:user});

    } catch (error:any) {
        return res.status(400).json({success:false,error:error.message})
    }
}