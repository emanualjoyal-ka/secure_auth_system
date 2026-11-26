import sessionModel from "../models/session.model.js";
import userModel from "../models/user.model.js";
import {generateAccessToken,generateRefreshToken,verifyRefreshToken} from "../utils/generateToken.js";
import bcrypt from "bcrypt";
import ApiError from "../utils/ApiError.js";
import {userLoginRequest,userLoginResponse} from "../dtos/auth.dto/loginDto.js";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import {userRegisterRequest,userRegisterResponse} from "../dtos/auth.dto/registerDto.js";
import { getUserResponse } from "../dtos/user.dto/getUserDto.js";
import { renewAccessTokenResponse } from "../dtos/auth.dto/refreshTokenDto.js";
import { AllSessionsDtoResponse } from "../dtos/auth.dto/sessionResponseDto.js";
import { generateAccountToken } from "../utils/accountToken.js";
import accountTokenModel from "../models/accountToken.model.js";  
import { env } from "../config/env.js";

export const createUser = async (user: userRegisterRequest): Promise<userRegisterResponse> => {
  const email = user.email.trim().toLowerCase();
  const userExists = await userModel.findOne({ email });
  if (userExists) throw new ApiError("User already exists", 409);
  const hashedPasswd = await bcrypt.hash(user.password, 10);
  const res = await userModel.create({
    name: user.name,
    email,
    password: hashedPasswd,
    isEmailVerified: false,
  });
  const { rawToken, tokenHash } = generateAccountToken();
  await accountTokenModel.create({
    userId: res._id,
    tokenHash,
    purpose: "email_verification",
    expiresAt: new Date(Date.now() + 30 * 60 * 1000)
  });
//   await sendVerificationEmail(user.email, rawToken);
  const response: userRegisterResponse = {
    id: res._id.toString(),
    name: res.name,
    email: res.email,
    role: res.role
  };
  if(env.APP_ENV === "demo" && env.EXPOSE_DEV_TOKENS === "true") response.verificationToken=rawToken;
  return response
};


export const loginUser = async (user: userLoginRequest): Promise<userLoginResponse> => {
  const email = user.email.trim().toLowerCase();
  const userExist = await userModel.findOne({ email });
  if (!userExist) throw new ApiError("Invalid email or password", 401);
  if (userExist.lockUntil && userExist.lockUntil > new Date()) throw new ApiError("Account is locked, Try again later", 423);
  const isMatch = await bcrypt.compare(user.password, userExist.password);
  if (!isMatch) {
    userExist.loginAttempts += 1;
    if (userExist.loginAttempts >= 5) userExist.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); //account blocks for 24 hours after 5 attempts
    await userExist.save();
    throw new ApiError("Invalid password", 401);
  }
  if (!userExist.isEmailVerified) throw new ApiError("Please verify your email before loggin in", 403);
  userExist.loginAttempts = 0;
  userExist.lockUntil = undefined;
  await userExist.save();
  const token_id = uuidv4();
  const accessToken = generateAccessToken({userId: userExist._id.toString(),role: userExist.role,token_id,tokenVersion: userExist.tokenVersion});
  const refreshToken = generateRefreshToken({userId: userExist._id.toString(),token_id,tokenVersion: userExist.tokenVersion});
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  await sessionModel.create({
    userId: userExist._id,
    refreshToken: hashedRefreshToken,
    token_id,
    userAgent: user.userAgent,
    ip: user.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return {
    user: {
      name: userExist.name,
      email: userExist.email,
      role: userExist.role,
    },
    accessToken,
    refreshToken,
  };
};

export const currentUser = async (userId: string): Promise<getUserResponse> => {
  const user_id = new mongoose.Types.ObjectId(userId);
  const user = await userModel.findById(user_id);
  if (!user) throw new ApiError("user not found", 404);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const handlerefreshtoken = async (token: string): Promise<renewAccessTokenResponse> => {
    if (!token) throw new ApiError("No refresh token provided", 401);
    const decoded = verifyRefreshToken(token);
    const user = await userModel.findById(decoded.userId);
    if (!user) throw new ApiError("Unauthorized", 401);
    if (decoded.tokenVersion !== user.tokenVersion) throw new ApiError("Session expired. Please login again.",401);
    const session = await sessionModel.findOne({
        userId: user._id,
        token_id: decoded.token_id,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    });
    if (!session) throw new ApiError("Session expired", 401);
    const isMatch = await bcrypt.compare(token,session.refreshToken);
    if (!isMatch) {
        await sessionModel.updateOne({_id: session._id,isRevoked: false},{$set: {isRevoked: true}});
        throw new ApiError("Refresh token reuse detected. Please login again.",401);
    }
    const newRefreshToken = generateRefreshToken({userId: user._id.toString(),token_id: session.token_id,tokenVersion: user.tokenVersion});
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken,10);
    const updatedSession = await sessionModel.findOneAndUpdate(
        {
            _id: session._id,
            userId: user._id,
            token_id: decoded.token_id,
            refreshToken: session.refreshToken,
            isRevoked: false,
            expiresAt: { $gt: new Date() }
        },
        {$set: {refreshToken: hashedNewRefreshToken,expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}},{new: true}
    );
    if (!updatedSession) {
        await sessionModel.updateOne({_id: session._id,isRevoked: false},{$set: {isRevoked: true}});
        throw new ApiError("Refresh token is no longer valid. Please login again.",401);
    }
    const newAccessToken = generateAccessToken({userId: user._id.toString(),role: user.role,token_id: session.token_id,tokenVersion: user.tokenVersion});
    return {
        name: user.name,
        email: user.email,
        newAccessToken,
        newRefreshToken
    };
};


// Logout from current device
export const logoutUser = async (refreshToken: string): Promise<void> => {
    if (!refreshToken) throw new ApiError("No refresh token provided", 400);
    const decoded = verifyRefreshToken(refreshToken);
    const user = await userModel.findById(decoded.userId);
    if (!user) throw new ApiError("Unauthorized", 401);
    if (decoded.tokenVersion !== user.tokenVersion) throw new ApiError("Session already expired", 401);
    const session = await sessionModel.findOne({
        userId: decoded.userId,
        token_id: decoded.token_id,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    });
    if (!session) throw new ApiError("Session not found", 404);
    const isMatch = await bcrypt.compare(refreshToken,session.refreshToken);
    if (!isMatch) throw new ApiError("Invalid refresh token", 401);
    const revokedSession = await sessionModel.findOneAndUpdate(
        {
            _id: session._id,
            userId: decoded.userId,
            isRevoked: false,
            refreshToken: session.refreshToken
        },
        {$set: {isRevoked: true}},{returnDocument: "after"}
    );
    if (!revokedSession) throw new ApiError("Session already expired", 401);
};


// Logout from all devices
export const logoutAllDevices = async (refreshToken: string): Promise<void> => {
    if (!refreshToken) throw new ApiError("No refresh token provided", 400);
    const decoded = verifyRefreshToken(refreshToken);
    const user = await userModel.findById(decoded.userId);
    if (!user) throw new ApiError("Unauthorized", 401);
    if (decoded.tokenVersion !== user.tokenVersion) throw new ApiError("Session already expired", 401);
    const currentSession = await sessionModel.findOne({
        userId: user._id,
        token_id: decoded.token_id,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    });
    if (!currentSession) throw new ApiError("Session not found", 404);
    const isMatch = await bcrypt.compare(refreshToken,currentSession.refreshToken);
    if (!isMatch) throw new ApiError("Invalid refresh token", 401);
    const mongoSession = await mongoose.startSession();
    try {
        await mongoSession.withTransaction(async () => {
            await userModel.updateOne(
                {_id: user._id,tokenVersion: decoded.tokenVersion},
                {$inc: {tokenVersion: 1}},
                {session: mongoSession}
            );
            await sessionModel.updateMany(
                {userId: user._id,isRevoked: false},
                {$set: {isRevoked: true}},
                {session: mongoSession}
            );
        });
    } finally {
        await mongoSession.endSession();
    }
};


// Logout from a specific device
export const logoutSession = async (userId: string | undefined,sessionId: unknown): Promise<void> => {
    if (!userId) throw new ApiError("Unauthorized", 401);
    if (typeof sessionId !== "string" || !mongoose.isValidObjectId(sessionId)) throw new ApiError("Invalid session ID", 400);
    const session = await sessionModel.findOneAndUpdate(
        {_id: sessionId,userId,isRevoked: false},
        {$set: {isRevoked: true}},
        {returnDocument: "after"}
    );
    if (!session) throw new ApiError("Session not found", 404);
};


export const getAllSessions = async (userId: string,page: number,limit: number): Promise<AllSessionsDtoResponse> => {
    if (!userId) throw new ApiError("Unauthorized", 401);
    if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) throw new ApiError("Invalid pagination parameters", 400);
    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;
    const filter = {
        userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    };
    const [sessions, totalItems] = await Promise.all([
        sessionModel
            .find(filter)
            .select("_id userAgent ip createdAt expiresAt")
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(safeLimit)
            .lean(),
        sessionModel.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(totalItems / safeLimit);
    return {
        data: sessions.map((session) => ({
            id: session._id.toString(),
            userAgent: session.userAgent ?? "Unknown device",
            ip: session.ip ?? "Unknown",
            createdAt: session.createdAt ?? session._id.getTimestamp(),
            expiresAt: session.expiresAt
        })),
        pagination: {
            page,
            limit: safeLimit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
};


export const changeUserPassword = async (userId: string | undefined,currentPassword: string,newPassword: string): Promise<void> => {
    if (!userId) throw new ApiError("Unauthorized", 401);
    const user = await userModel.findById(userId);
    if (!user) throw new ApiError("User not found", 404);
    const isMatch = await bcrypt.compare(currentPassword,user.password);
    if (!isMatch) throw new ApiError("Current password is incorrect",400);
    const isSame = await bcrypt.compare(newPassword,user.password);
    if (isSame) throw new ApiError("New password cannot be same as previous password",400);
    const hashedPassword = await bcrypt.hash(newPassword,10);
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const updatedUser = await userModel.findOneAndUpdate(
                {_id: user._id,password: user.password,tokenVersion: user.tokenVersion},
                {$set: {password: hashedPassword,passwordChangedAt: new Date()},$inc: {tokenVersion: 1}},
                {returnDocument: "after",session}
            );
            if (!updatedUser) throw new ApiError("Password was changed by another request. Please try again.",409);
            await sessionModel.updateMany(
                {userId: user._id,isRevoked: false},
                {$set: {isRevoked: true}},
                {session}
            );
        });
    } finally {
        await session.endSession();
    }
};

