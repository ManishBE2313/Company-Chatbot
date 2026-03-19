import { Router } from "express";
import { JobController } from "../controllers/job";
import { auth } from "../middlewares/auth";
import { apiRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

// Route: POST /api/jobs/setup
// This expects the Job payload and triggers the database save & AI target generation
router.post(
  "/setup",
  apiRateLimiter,
  auth,
  JobController.createJob
);

export default router;