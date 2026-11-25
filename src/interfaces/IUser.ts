import { Document } from "mongoose";


export interface IUser extends Document{
    name:string;
    email:string;
    password:string;
    role:"user" | "admin";
    loginAttempts:number;
    lockUntil?:Date | undefined;
    passwordChangedAt?:Date;
    isEmailVerified:boolean;
    emailVerifiedAt?:Date;
    tokenVersion:number;
}