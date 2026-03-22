import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js"
import helmet from "helmet";
import { createLimiter } from "./middleware/rateLimit.middleware.js";

const app=express();
const apiLimiter=createLimiter(15*60*1000,100,"Too many requests")

app.use(cors({origin:process.env.CLIENT_URL,credentials:true})); //allows only given url to connect
app.use(express.json()); //middleware to read JSON
app.use(cookieParser()); //middleware to read cookies
app.use(helmet()); //prevents XSS attacks, Hide server info, Adds secure HTTP headers
app.use(apiLimiter); // limits requests

app.use("/api/auth",authRoutes);

export default app;