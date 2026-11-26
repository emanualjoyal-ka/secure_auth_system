import mongoose from "mongoose";
import {describe,it,expect, beforeEach, afterEach} from "vitest"
import userModel from "../../../src/models/user.model";
import { loginRequest, loginUserData, registerRequest, userData } from "../../helpers/auth.helper";


describe("POST /api/auth/login",()=>{
    beforeEach(async () => {
        if (mongoose.connection.name !== "secure_auth_server_test") throw new Error("Unsafe database! Expected auth_test");    
        await userModel.deleteMany({});
        await registerRequest(userData);
        await userModel.updateOne(
        { email: userData.email },
        { $set: { isEmailVerified: true } });
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    it("Should login user with valid credentials",async()=>{
        const res=await loginRequest(loginUserData);
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.message).toBe("Logged in successfully")
        expect(res.body.data?.role).toBe("user")
    })

    it("Login should login with an incorrect password",async()=>{
        const res=await loginRequest({
            ...loginUserData,
            password:"incorrect-password"
        })
        expect(res.status).toBe(401)
    })

    it("Login should fail if user doesn't exists",async()=>{
        const res=await loginRequest({
            email:"test2@gmail.com",
            password:"Password12!"
        })
        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
        expect(res.body.message).toBe("Invalid email or password")
        const user=await userModel.findOne({email:"test2@gmail.com"})
        expect(user).toBe(null)
    })

    it("Should reject login if email is missing",async()=>{
        const res=await loginRequest({
            password:loginUserData.password
        })
        expect(res.status).toBe(400);
    })

    it("Should reject login if password is missing",async()=>{
        const res=await loginRequest({
            email:loginUserData.email
        })
        expect(res.status).toBe(400);
    })

    it("Should reject invalid email",async()=>{
        const res=await loginRequest({
            ...loginUserData,
            email:"invalid-email"
        })
        expect(res.status).toBe(400)
    })

    it("Should reject password with length less than 6 characters",async()=>{
        const res=await loginRequest({
            ...loginUserData,
            password:"12345"
        })
        expect(res.status).toBe(400)
    })

    it("should reject login when any other fields are provided other than email and password", async () => {
        const response = await loginRequest({
            ...loginUserData,
            role:"admin"
        });
        expect(response.status).toBe(400);
    });
    
    it("should reject registration when all required fields are missing", async () => {
        const response = await loginRequest({});
        expect(response.status).toBe(400);
    });

    it("should reject email when it is a number", async () => {
        const response = await loginRequest({
            ...loginUserData,
            email:12345
        });
        expect(response.status).toBe(400);
    });
    
    it("should reject password when it is a number", async () => {
        const response = await loginRequest({
            ...loginUserData,
            password:12345678
        });
        expect(response.status).toBe(400);
    });

    it("Login fails if account is locked for a certain period",async()=>{
        await userModel.updateOne({email:loginUserData.email},{$set:{lockUntil:new Date(Date.now() + 24 * 60 * 60 * 1000)}})
        const res=await loginRequest(loginUserData)
        expect(res.status).toBe(423)
        expect(res.body.success).toBe(false)
        expect(res.body.message).toBe("Account is locked, Try again later")
    })

    it("Should lock account after 5 failed login attempts",async()=>{
        for(let i=1;i<=5;i++){
            const res=await loginRequest({
                ...loginUserData,
                password:"WrongPassword123!"
            });
            expect(res.status).toBe(401);
        }   
        const res = await loginRequest(loginUserData);
        expect(res.status).toBe(423)
        expect(res.body.success).toBe(false)
        expect(res.body.message).toBe("Account is locked, Try again later")
    })

})