import { Router } from "express";
import { forgotPasswordController, resendVerificationController, resetPasswordController, verifyEmailController } from "../controllers/account.controller.js";
import validate from "../middleware/validate.middleware.js";
import { forgotPasswordValidation, resendVerificationTokenValidation, resetPasswordValidation } from "../validations/accountValidation.js";
import { forgotPasswordLimiter, resendVerificationLimiter, resetPasswordLimiter, verifyEmailLimiter } from "../config/rateLimiters.js";


const router = Router();

router.post("/verify-email",verifyEmailLimiter,verifyEmailController);
router.post("/resend-verification",resendVerificationLimiter,validate(resendVerificationTokenValidation),resendVerificationController);
router.post("/forgot-password",forgotPasswordLimiter,validate(forgotPasswordValidation),forgotPasswordController);
router.post("/reset-password",resetPasswordLimiter,validate(resetPasswordValidation),resetPasswordController);

export default router;
