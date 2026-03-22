import mongoose from "mongoose";
import { ISession } from "../interfaces/ISession.js";
import bcrypt from "bcrypt";

const sessionSchema=new mongoose.Schema<ISession>({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    refreshToken:{
        type:String,
        required:true,
        index:true
    },
    isValid:{
        type:Boolean,
        default:true
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

sessionSchema.pre<ISession>("save",async function(){ //hashing requestToken incase db is leaked 
    if(!this.isModified("refreshToken")) return;

    this.refreshToken=await bcrypt.hash(this.refreshToken,10);
})

sessionSchema.index({expiresAt:1},{expireAfterSeconds:0}) //auto deletes expired sessions

export default mongoose.model<ISession>("Session",sessionSchema);