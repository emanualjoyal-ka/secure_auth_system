import express, { Response,Request}  from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import accountRoutes from "./routes/account.routes.js";
import helmet from "helmet";
import errorHandler from "./middleware/error.middleware.js";
import { env } from "./config/env.js";
import { apiLimiter } from "./config/rateLimiters.js";

const app=express();

app.use(cors({origin:env.CLIENT_URL,credentials:true})); //allows only given url to connect
// app.use(cors({origin:true,credentials:true})); //any one can test it
app.use(express.json()); //middleware to read JSON
app.use(cookieParser()); //middleware to read cookies
app.use(helmet()); //prevents XSS attacks, Hide server info, Adds secure HTTP headers
app.use(apiLimiter); // limits all requests

app.use("/api/auth",authRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/account", accountRoutes);


app.get("/", (_req:Request, res:Response) => {
  res.send("API is running");
});

app.get('/api/health', (_req:Request, res:Response) => {    //for avoiding cold start since deployed in free tier in render
  res.json({ status: 'ok' });       //using uptimerobot which sends GET request every 5 minutes
});

app.use(errorHandler);


export default app;