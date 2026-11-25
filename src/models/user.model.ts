import mongoose from "mongoose";
import { IUser } from "../interfaces/IUser.js";


const userSchema=new mongoose.Schema<IUser>({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true,
        lowercase:true //avoid duplicate because of case differences
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    emailVerifiedAt:{
        type:Date
    },
    loginAttempts:{
        type:Number,
        default:0
    },
    lockUntil:{
        type:Date
    },
    passwordChangedAt:{
        type:Date
    },
    tokenVersion:{
        type:Number,
        default:0
    }
},
{
    timestamps:true
});


export default mongoose.model<IUser>("User",userSchema);