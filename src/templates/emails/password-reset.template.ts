
export const passwordResetTemplate = (resetUrl: string) =>{
    return  `
            <h2>Password Reset</h2>
            <p>We received a request to reset your password.</p>
            <p>Click below to reset your password.</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link expires in 15 minutes.</p>
            <p>If you didn't request a password reset,
            you can safely ignore this email.</p>`;
}