import nodemailer from "nodemailer";
import { env } from "./env.js";
import { passwordResetTemplate } from "../templates/emails/password-reset.template.js";
import { emailVerificationTemplate } from "../templates/emails/email-verification.template.js";

const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: Number(env.EMAIL_PORT),
    secure: Number(env.EMAIL_PORT) === 465,
    auth: {
        user: env.EMAIL_ID,
        pass: env.EMAIL_PASSWORD
    }
});

export const sendVerificationEmail = async (email: string,token: string) => {
    // since there is no front end, the link sends to backend, change to front end url when it is available
    const verificationUrl = `${env.BACKEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
    await transporter.sendMail({
        from: env.EMAIL_ID,
        to: email,
        subject: "Verify your email address",
        html: emailVerificationTemplate(verificationUrl)
    });
};

export const sendPasswordResetEmail = async (email: string,token: string) => {
    // since there is no front end, the link sends to backend, change to front end url when it is available
    const resetUrl = `${env.BACKEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
    await transporter.sendMail({
        from: env.EMAIL_ID,
        to: email,
        subject: "Password Reset Request",
        html: passwordResetTemplate(resetUrl)
    });
};
