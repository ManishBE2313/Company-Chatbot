import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { apiRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.get("/sso/login", apiRateLimiter, AuthController.initiateSsoLogin);
router.post("/sso/requests", apiRateLimiter, AuthController.createSsoRequest);
router.get("/sso/requests/:requestId", apiRateLimiter, AuthController.getSsoRequestStatus);
router.post("/sso/sync", AuthController.syncSsoUser);

export default router;