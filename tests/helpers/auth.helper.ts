import request from "supertest";
import app from "../../src/app";


export interface RegisterUserData{
    name:string;
    email:string;
    password:string;
}

export const userData:RegisterUserData={
    name:"test",
    email:"test@gmail.com",
    password:"Password123!"
}

export const registerRequest=(data:RegisterUserData|Record<string, unknown>)=>{
    return request(app).post("/api/auth/register").send(data)
}