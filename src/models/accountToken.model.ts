import mongoose from "mongoose";


const accountTokenSchema=new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            index:true
        },
        tokenHash:{
            type:String,
            required:true,
            unique:true
        },
        purpose:{
            type:String,
            enum:["email_verification","password_reset"],
            required:true
        },
        expiresAt:{
            type:Date,
            required:true
        },
        usedAt:{
            type:Date,
            default:null
        }
    },
    {
        timestamps:true
    }
)

accountTokenSchema.index({expiresAt:1},{expireAfterSeconds:0})
accountTokenSchema.index({userId:1,prupose:1,usedAt:1})

export default mongoose.model("AccountToken",accountTokenSchema)