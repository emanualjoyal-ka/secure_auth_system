import mongoose from "mongoose";
import { ISession } from "../interfaces/ISession.js";

const sessionSchema=new mongoose.Schema<ISession>({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    refreshToken:{
        type:String,
        required:true
    },
    token_id:{
        type:String,
        required:true
    },
    isRevoked:{
        type:Boolean,
        default:false
    },
    userAgent:{
        type:String // device or browser info
    },
    ip:{
        type:String //ip address
    },
    expiresAt:{
        type:Date,
        required:true
    }
},
{
    timestamps:true
})

sessionSchema.index({expiresAt:1},{expireAfterSeconds:0}) //auto deletes expired sessions
sessionSchema.index({ userId: 1, token_id: 1 },{unique:true}); //avoids scanning entire documents

export default mongoose.model<ISession>("Session",sessionSchema);