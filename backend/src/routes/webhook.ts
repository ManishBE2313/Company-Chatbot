import { Router } from "express";
import { WebhookController } from "../controllers/webhook";
import { apiRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post(
  "/ai-result",
  apiRateLimiter,
  WebhookController.processAiResult
);

export default router;
