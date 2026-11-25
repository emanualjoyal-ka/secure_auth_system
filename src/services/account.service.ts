import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import {generateAccountToken,hashAccountToken} from "../utils/accountToken.js";
import accountTokenModel from "../models/accountToken.model.js";
import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import sessionModel from "../models/session.model.js";
import { env } from "../config/env.js";
import { forgotPasswordResponse, resendVerificationResponse } from "../dtos/auth.dto/verificationResponse.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../config/email.js";


export const verifyEmail = async (token: string): Promise<void> => {
  if (!token || typeof token !== "string") throw new ApiError("Invalid or expired verification link", 400);
  const tokenHash = hashAccountToken(token);
  const accountToken = await accountTokenModel.findOne({tokenHash,purpose: "email_verification",usedAt: null,expiresAt: { $gt: new Date() }});
  if (!accountToken) throw new ApiError("Invalid or expired verification link", 400);
  const session = await mongoose.startSession();
  try{
    await session.withTransaction(async () => {
        const consumedToken = await accountTokenModel.findOneAndUpdate(
        {_id: accountToken._id,usedAt: null,expiresAt: { $gt: new Date() },purpose: "email_verification"},
        {$set: {usedAt: new Date()}},
        {returnDocument: "after", // returns as updated data instead of old data
         session // says this operation belongs to the 'session' transaction or it executes outside transaction
        }
        );
        if (!consumedToken) throw new ApiError("Invalid or expired verification link", 400);
        const updatedUser = await userModel.findOneAndUpdate(
        {_id: consumedToken.userId,isEmailVerified: false},
        {$set: {isEmailVerified: true,emailVerifiedAt: new Date()}},
        {returnDocument: "after",session}
        );
        if (!updatedUser) throw new ApiError("Account already verified or unavailable", 400);
    });
 }finally{
        await session.endSession();
 }
};


const GENERIC_VERIFICATION_MESSAGE = "If an account requires verification, a verification email will be sent.";

export const resendVerification = async (email: string,): Promise<resendVerificationResponse> => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await userModel.findOne({ email: normalizedEmail });
  if (!user || user.isEmailVerified) return { message: GENERIC_VERIFICATION_MESSAGE };
  const { rawToken, tokenHash } = generateAccountToken();
  const session = await mongoose.startSession();
  try{
  await session.withTransaction(async () => {
    await accountTokenModel.updateMany(
      {userId: user._id,purpose: "email_verification",usedAt: null},
      {$set: {usedAt: new Date()}}, // Invalidates previous unused verification tokens
      {session} 
    );
    
    await accountTokenModel.create(
      [ // '[]' using this because there is second arguement which is '{session}' given below 
        {
          userId: user._id,
          tokenHash,
          purpose: "email_verification",
          expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        }
      ],{session}
    );
  });
  await sendVerificationEmail(normalizedEmail, rawToken);
  }finally{
    await session.endSession();
  }
  const response:resendVerificationResponse={
    message:GENERIC_VERIFICATION_MESSAGE
  }
  if (env.APP_ENV === "demo" && env.EXPOSE_DEV_TOKENS === "true") response.verificationToken = rawToken;
  return response;
};



const GENERIC_RESET_MESSAGE = "If an account exists with this email, password reset instructions will be sent.";

export const forgotPassword = async (email: string): Promise<forgotPasswordResponse> => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({email: normalizedEmail});
    if (!user) return {message: GENERIC_RESET_MESSAGE};
    const { rawToken, tokenHash } = generateAccountToken();
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            await accountTokenModel.updateMany(
                {userId: user._id,purpose: "password_reset",usedAt: null},
                {$set: {usedAt: new Date()}},
                {session}
            );
            await accountTokenModel.create(
                [{
                    userId: user._id,
                    tokenHash,
                    purpose: "password_reset",
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000)}],
                {session}
            );
        });
        await sendPasswordResetEmail(normalizedEmail,rawToken);
    } finally {
        await session.endSession();
    }
    const response:forgotPasswordResponse={
        message:GENERIC_RESET_MESSAGE
    }
    if (env.APP_ENV === "demo" && env.EXPOSE_DEV_TOKENS === "true") response.verificationToken = rawToken;
    return response;
};


export const resetPassword = async (token: string,newPassword: string): Promise<void> => {
    if (!token || typeof token !== "string") throw new ApiError("Invalid or expired reset link", 400);
    const tokenHash = hashAccountToken(token);
    const accountToken = await accountTokenModel.findOne({
        tokenHash,
        purpose: "password_reset",
        usedAt: null,
        expiresAt: { $gt: new Date() }
    });
    if (!accountToken) throw new ApiError("Invalid or expired reset link",400);
    const hashedPassword = await bcrypt.hash(newPassword,10);
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const consumedToken = await accountTokenModel.findOneAndUpdate(
                    {
                        _id: accountToken._id,
                        purpose: "password_reset",
                        usedAt: null,
                        expiresAt: { $gt: new Date() }
                    },
                    {$set: {usedAt: new Date()}},
                    {returnDocument: 'after',session}
                );
            if (!consumedToken) throw new ApiError("Invalid or expired reset link",400);
            const updatedUser = await userModel.findByIdAndUpdate(
                consumedToken.userId,
                {$set: {password: hashedPassword,passwordChangedAt: new Date()},$inc: {tokenVersion: 1}},
                {returnDocument: 'after',session}
            );
            if (!updatedUser) throw new ApiError("Account not found",404);
            await sessionModel.updateMany(
                {userId: consumedToken.userId,isRevoked: false},
                {$set: {isRevoked: true}},
                {session}
            );
        });
    } finally {
        await session.endSession();
    }
};

