import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getSessions } from "../controllers/session.controller.js";
import { createLimiter } from "../middleware/rateLimit.middleware.js";

const router=Router();
const sessionLimiter=createLimiter(15*60*1000,100,"Too many attempts, try later");//100 attempts

router.get("/sessions",authenticate,sessionLimiter,getSessions);

export default router;