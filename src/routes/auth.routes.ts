import express from "express";
import { allDeviceLogout, changePassword, getUser, logout, logoutDevice, refreshTokenController, registerUser, userLogin } from "../controllers/auth.controller.js";
import { createLimiter } from "../middleware/rateLimit.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { loginValidation, registerValidation } from "../validations/auth.validation.js";

const router=express.Router();
const registerLimiter=createLimiter(15*60*1000,10,"Too many register attempts"); //10 attempts within 15 minutes 
const loginLimiter=createLimiter(15*60*1000,10,"Too many login attempts, try again later");//10 atttempts
const refreshLimiter=createLimiter(15*60*1000,20,"Too many refresh attempts, try later");//20 attempts
const logoutLimiter=createLimiter(15*60*1000,50,"Too many logout attempts, try again later");//50 attempts
const changePasswordLimiter=createLimiter(15*60*1000,5,"Too many attempts"); //5 attempts

router.post("/register",registerLimiter,validate(registerValidation),registerUser);
router.post("/login",validate(loginValidation),userLogin);
router.get("/me",authenticate,getUser)
router.post("/logout",logoutLimiter,logout);
router.post("/refresh",refreshLimiter,refreshTokenController);
router.post("/logout-all-devices",logoutLimiter,allDeviceLogout);
router.post("/logout-device",logoutLimiter,authenticate,logoutDevice);
router.post("/change-password",authenticate,changePasswordLimiter,changePassword);


export default router;