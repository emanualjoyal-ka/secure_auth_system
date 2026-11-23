import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize, UserRole } from "../middleware/role.middleware.js";
import { createUser } from "../controllers/admin.controller.js";


const router=Router();

router.post("/create-user",authenticate,authorize(UserRole.ADMIN),createUser);


export default router;