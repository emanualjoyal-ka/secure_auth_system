import {describe,it,expect, beforeEach, afterEach} from "vitest"
import userModel from "../../../src/models/user.model"
import mongoose from "mongoose"
import { registerRequest, userData } from "../../helpers/auth.helper"
import bcrypt from "bcrypt"

describe("POST /api/auth/register",()=>{
    
    beforeEach(async () => {
        if (mongoose.connection.name !== "secure_auth_server_test") throw new Error("Unsafe database! Expected auth_test");    
        await userModel.deleteMany({});
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    it("Should register user with valid credentials",async()=>{
        const res=await registerRequest(userData)
        expect(res.status).toBe(201)
        expect(res.body.success).toBe(true)
        expect(res.body.message).toBe("User created successfully")
        expect(res.body.data?.role).toBe("user")
    })

    it("Should reject registration when name is missing",async()=>{
        const res=await registerRequest({
            email:userData.email,
            password:userData.password
        })
        expect(res.status).toBe(400)
    })

    it("Should reject registration when email is missing",async()=>{
        const res=await registerRequest({
            name:userData.name,
            password:userData.password
        })
        expect(res.status).toBe(400)
    })

    it("Should reject registration when password is missing",async()=>{
        const res=await registerRequest({
            name:userData.name,
            email:userData.email
        })
        expect(res.status).toBe(400)
    })

    it("Should reject invalid email",async()=>{
        const res=await registerRequest({
            ...userData,
            email:"invalid-email"
        })
        expect(res.status).toBe(400)
    })

    it("Should reject password with length less than 6 characters",async()=>{
        const res=await registerRequest({
            ...userData,
            password:"12345"
        })
        expect(res.status).toBe(400)
    })

    it("should hash password before storing in database",async()=>{
        const res=await registerRequest(userData);
        expect(res.status).toBe(201)
        const user=await userModel.findOne({email:userData.email})
        expect(user).not.toBeNull();
        expect(user!.password).not.toBe(userData.password)
        const isPasswordValid=await bcrypt.compare(userData.password,user!.password)
        expect(isPasswordValid).toBe(true);
    })

    it("Should reject duplicate email registration",async()=>{
        await registerRequest(userData)
        const res=await registerRequest(userData)
        expect(res.status).toBe(409)
    })

    it("should never return the user's password", async () => {
        const res = await registerRequest(userData);
        expect(res.body.data?.password).toBeUndefined();
        expect(JSON.stringify(res.body)).not.toContain(userData.password);
    });

    it("should reject registration when role is provided", async () => {
        const response = await registerRequest({
            ...userData,
            role:"admin"
        });
        expect(response.status).toBe(400);
        expect(response.body.data?.role).not.toBe("admin");
    });

    it("should reject registration when any other fields are provided other than name,email and password", async () => {
        const response = await registerRequest({
            ...userData,
            role:"admin"
        });
        expect(response.status).toBe(400);
    });

    it("should reject registration when all required fields are missing", async () => {
        const response = await registerRequest({});
        expect(response.status).toBe(400);
    });

    it("should reject name when it is a number", async () => {
        const response = await registerRequest({
            ...userData,
            name:123
        });
        expect(response.status).toBe(400);
    });

    it("should reject name when it is an object", async () => {
        const response = await registerRequest({
            ...userData,
            name:{first:"John"}
        });
        expect(response.status).toBe(400);
    });

    it("should reject email when it is a number", async () => {
        const response = await registerRequest({
            ...userData,
            email:12345
        });
        expect(response.status).toBe(400);
    });

    it("should reject password when it is a number", async () => {
        const response = await registerRequest({
            ...userData,
            password:12345678
        });
        expect(response.status).toBe(400);
    });
})