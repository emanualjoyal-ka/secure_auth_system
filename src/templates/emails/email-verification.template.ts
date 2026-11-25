

export const emailVerificationTemplate=(verificationUrl:string)=>{
    return  `<h2>Verify your email</h2>
            <p>Thank you for registering.</p>
            <p>Click the button below to verify your email address.</p>
            <a href="${verificationUrl}"
               style="
                   display:inline-block;
                   padding:12px 20px;
                   background:#2563eb;
                   color:white;
                   text-decoration:none;
                   border-radius:5px;
               ">
                Verify Email
            </a>
            <p>This link expires in 30 minutes.</p>
            <p>If you didn't create this account, you can ignore this email.</p>`;
}