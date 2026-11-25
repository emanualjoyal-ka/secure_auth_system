import express from "express";
import { allDeviceLogout, changePassword, getSessions, getUser, logout, logoutDevice, refreshTokenController, registerUser, userLogin } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { loginValidation, registerValidation } from "../validations/auth.validation.js";
import { changePasswordValidation } from "../validations/changePassword.validation.js";
import { changePasswordLimiter, loginLimiter, logoutAllDevicesLimiter, logoutDeviceLimiter, logoutLimiter, refreshLimiter, registerLimiter } from "../config/rateLimiters.js";

const router=express.Router();


router.post("/register",registerLimiter,validate(registerValidation),registerUser);
router.post("/login",loginLimiter,validate(loginValidation),userLogin);
router.get("/me",authenticate,getUser)
router.post("/logout",logoutLimiter,logout);
router.post("/refresh",refreshLimiter,refreshTokenController);
router.post("/logout-all-devices",logoutAllDevicesLimiter,authenticate,allDeviceLogout);
router.post("/logout-device/:sessionId",logoutDeviceLimiter,authenticate,logoutDevice);
router.post("/change-password",changePasswordLimiter,authenticate,validate(changePasswordValidation),changePassword);
router.get("/get-sessions",authenticate,getSessions)


export default router;