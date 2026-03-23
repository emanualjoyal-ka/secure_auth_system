import { Router, Response, Request } from "express";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router=Router();

router.get("/csrf-token",csrfProtection,(req:Request,res:Response)=>{  //frontend will call
    res.json({csrfToken:req.csrfToken()});
})

export default router;