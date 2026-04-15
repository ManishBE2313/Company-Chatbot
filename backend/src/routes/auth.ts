import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { auth } from "../middlewares/auth";
import { apiRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.get("/me", auth, AuthController.getCurrentUser);
router.get("/sso/login", apiRateLimiter, AuthController.initiateSsoLogin);
router.post("/sso/requests", apiRateLimiter, AuthController.createSsoRequest);
router.get("/sso/requests/:requestId", apiRateLimiter, AuthController.getSsoRequestStatus);
router.post("/sso/sync", AuthController.syncSsoUser);

export default router;
