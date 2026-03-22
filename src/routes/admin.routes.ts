import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { createUser } from "../controllers/admin.controller.js";


const router=Router();

router.post("/create-user",authenticate,authorize("admin"),createUser);


export default router;