import { Document, Types } from "mongoose"


export interface ISession extends Document{
    userId:Types.ObjectId;
    refreshToken:string;
    token_id:string;
    isRevoked:boolean;
    userAgent?:string;
    ip?:string;
    expiresAt:Date;
    createdAt?:Date;
    updatedAt?:Date;
}