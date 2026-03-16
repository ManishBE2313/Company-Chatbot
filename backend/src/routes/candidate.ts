import { Router } from "express";
import { CandidateController } from "../controllers/candidate";
import { auth } from "../middlewares/auth";
import { apiRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post(
  "/upload",
  apiRateLimiter,
  auth,
  CandidateController.uploadCV
);

export default router;
