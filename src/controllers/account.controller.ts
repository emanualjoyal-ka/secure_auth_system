import { Request, Response} from "express";
import { forgotPassword, resendVerification, resetPassword, verifyEmail } from "../services/account.service.js";
import { sendResponse } from "../utils/ApiResponse.js";


export const verifyEmailController = async (req: Request,res: Response) => {
        const { token } = req.query;
        await verifyEmail(token as string);
        return sendResponse(res,{
            statusCode:200,
            message: "Email verified successfully"
        })
};


export const resendVerificationController = async (req: Request,res: Response) => {
        const { email } = req.body;
        const result = await resendVerification(email);
        return sendResponse(res,{
            statusCode:200,
            data:result
        })
};


export const forgotPasswordController = async (req: Request,res: Response) => {
        const { email } = req.body;
        const result = await forgotPassword(email);
        return sendResponse(res,{
            statusCode:200,
            data:result
        })
};


export const resetPasswordController = async (req: Request,res: Response,) => {
        const {token,newPassword} = req.body;
        await resetPassword(token,newPassword);
        return sendResponse(res,{
            statusCode:200,
            message:"Password reset successfully. Please log in"
        })
};
