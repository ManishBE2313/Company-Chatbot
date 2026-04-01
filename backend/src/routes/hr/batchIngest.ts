// src/routes/hr/batchIngest.ts
import { Router } from "express";
import { BatchIngestController } from "../../controllers/batchIngest";
import { auth } from "../../middlewares/auth";
import { apiRateLimiter } from "../../middlewares/rateLimiter";

// mergeParams: true allows us to access the :jobId from the parent router
const router = Router({ mergeParams: true });

// Route: POST /api/hr/jobs/:jobId/sharepoint-sync
// Triggers the background batch import of resumes for a specific job
router.post(
  "/sharepoint-sync",
  apiRateLimiter, // Using your existing rate limiter
  auth,           // Using your existing auth middleware
  BatchIngestController.triggerSharepointSync
);

export default router;