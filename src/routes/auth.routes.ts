import express from "express";
import { allDeviceLogout, logout, refreshTokenController, registerUser, userLogin } from "../controllers/auth.controller.js";
import { createLimiter } from "../middleware/rateLimit.middleware.js";

const router=express.Router();
const registerLimiter=createLimiter(15*60*1000,10,"Too many register attempts");
const loginLimiter=createLimiter(15*60*1000,5,"Too many login attempts, try again later");
const refreshLimiter=createLimiter(15*60*1000,20,"Too many refresh attempts, try later");
const logoutLimiter=createLimiter(15*60*1000,50,"Too many logout attempts, try again later");

router.post("/register",registerLimiter,registerUser);
router.post("/login",loginLimiter,userLogin);
router.post("/refresh",refreshLimiter,refreshTokenController);
router.post("/logout",logoutLimiter,logout);
router.post("/logout-all-devices",logoutLimiter,allDeviceLogout);


export default router;