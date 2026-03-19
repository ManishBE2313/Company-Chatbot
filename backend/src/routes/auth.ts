import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { apiRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.get("/sso/login", apiRateLimiter, AuthController.initiateSsoLogin);

export default router;
