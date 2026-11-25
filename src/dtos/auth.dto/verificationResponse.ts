

export interface resendVerificationResponse{
    message:string;
    verificationToken?:string
}

export interface forgotPasswordResponse extends resendVerificationResponse{}