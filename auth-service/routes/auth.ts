import { Router } from "express";
import { AuthController } from "../controllers/auth";

const router = Router();

router.get("/requests/:requestId", AuthController.getRequestStatus);
router.get("/callback", AuthController.callback);
router.post("/refresh", AuthController.refresh);
router.get("/logout", AuthController.logout);
router.post("/logout", AuthController.logout);

export default router;