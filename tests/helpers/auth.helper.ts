import request from "supertest";
import app from "../../src/app";


export interface LoginUserData{
    email:string;
    password:string;
}

export interface RegisterUserData extends LoginUserData{
    name:string;
}   

export const userData:RegisterUserData={
    name:"test",
    email:"test@gmail.com",
    password:"Password123!"
}

export const loginUserData:LoginUserData={
    email:"test@gmail.com",
    password:"Password123!"
}

export const registerRequest=(data:RegisterUserData|Record<string, unknown>)=>{
    return request(app).post("/api/auth/register").send(data)
}

export const loginRequest=(data:LoginUserData|Record<string,unknown>)=>{
    return request(app).post("/api/auth/login").send(data)
}