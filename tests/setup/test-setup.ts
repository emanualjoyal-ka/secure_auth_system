import { beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

beforeAll(async () => {
    // console.log("Connecting to test database");
    await mongoose.connect(process.env.MONGO_TEST_URI!);
    // console.log("Test database connected");
});

afterAll(async () => {
    await mongoose.disconnect();
    // console.log("Test database disconnected");
});
