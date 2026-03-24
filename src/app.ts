import express, { Response,Request}  from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import csrfRoutes from "./routes/csrf.routes.js";
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
app.use("/api/admin",adminRoutes);
app.use("/api",csrfRoutes);
app.use("/api/session",sessionRoutes);
app.get('/api/health', (_req:Request, res:Response) => {    //for avoiding cold start since i am deployed in free tier render
  res.json({ status: 'ok' });       //using uptimerobot which sends GET request every 5 minutes
});

export default app;