import express from "express";
import { allDeviceLogout, changePassword, logout, logoutDevice, refreshTokenController, registerUser, userLogin } from "../controllers/auth.controller.js";
import { createLimiter } from "../middleware/rateLimit.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router=express.Router();
const registerLimiter=createLimiter(15*60*1000,10,"Too many register attempts"); //10 attempts within 15 minutes 
const loginLimiter=createLimiter(15*60*1000,10,"Too many login attempts, try again later");//10 atttempts
const refreshLimiter=createLimiter(15*60*1000,20,"Too many refresh attempts, try later");//20 attempts
const logoutLimiter=createLimiter(15*60*1000,50,"Too many logout attempts, try again later");//50 attempts
const changePasswordLimiter=createLimiter(15*60*1000,5,"Too many attempts"); //5 attempts

router.post("/register",registerLimiter,registerUser);
router.post("/login",loginLimiter,userLogin);
router.post("/refresh",csrfProtection,refreshLimiter,refreshTokenController);
router.post("/logout",csrfProtection,logoutLimiter,logout);
router.post("/logout-all-devices",csrfProtection,logoutLimiter,allDeviceLogout);
router.post("/logout-device",csrfProtection,logoutLimiter,authenticate,logoutDevice);
router.post("/change-password",csrfProtection,authenticate,changePasswordLimiter,changePassword);


export default router;