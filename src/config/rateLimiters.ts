import { createLimiter } from "../middleware/rateLimit.middleware.js";


// Auth limiters
export const registerLimiter=createLimiter(15*60*1000,10,"Too many register attempts"); //10 attempts within 15 minutes 
export const loginLimiter=createLimiter(15*60*1000,10,"Too many login attempts, try again later");//10 atttempts
export const refreshLimiter=createLimiter(15*60*1000,20,"Too many refresh attempts, try later");//20 attempts
export const logoutLimiter=createLimiter(15*60*1000,50,"Too many logout attempts, try again later");//50 attempts
export const logoutAllDevicesLimiter=createLimiter(15*60*1000,50,"Too many logout attempts, try again later");//50 attempts
export const logoutDeviceLimiter=createLimiter(15*60*1000,50,"Too many logout attempts, try again later");//50 attempts
export const changePasswordLimiter=createLimiter(15*60*1000,5,"Too many attempts"); //5 attempts

// Account limiters
export const resendVerificationLimiter=createLimiter(15*60*1000,3,"Too many attempts, try later");//3 attempts
export const verifyEmailLimiter=createLimiter(15*60*1000,10,"Too many attempts, try later");//10 attempts
export const resetPasswordLimiter=createLimiter(15*60*1000,3,"Too many attempts, try later");//3 attempts
export const forgotPasswordLimiter = createLimiter(15 * 60 * 1000,5,"Too many attempts, try later");

// Global limiter
export const apiLimiter=createLimiter(15*60*1000,100,"Too many requests");