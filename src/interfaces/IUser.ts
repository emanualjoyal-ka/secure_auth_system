import { Document } from "mongoose";


export interface IUser extends Document{
    name:string;
    email:string;
    password:string;
    role:"user" | "admin";
    loginAttempts:number;
    lockUntil?:Date | undefined;
    comparePassword(enteredPassword:string):Promise<boolean>;
}