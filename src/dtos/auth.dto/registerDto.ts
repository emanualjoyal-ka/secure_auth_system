export interface userRegisterRequest{
    name:string;
    email:string;
    password:string;
}

export interface userRegisterResponse{
    id:string;
    name:string;
    email:string;
    role:string;
    verificationToken?:string;
}