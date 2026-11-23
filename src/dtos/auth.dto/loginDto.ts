export interface userLoginRequest{
    email:string,
    password:string,
    userAgent:string,
    ip:string;
}

export interface userLoginResponse{
    user:{
        name:string;
        email:string;
        role:string;
    }
    accessToken:string;
    refreshToken:string;
}