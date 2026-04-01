import { Router } from "express";
import { JobController } from "../../controllers/job";
import { ApplicationController } from "../../controllers/application";
import { auth } from "../../middlewares/auth";
import { apiRateLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.get("/", apiRateLimiter, auth, JobController.listJobs);
router.get("/:jobId", apiRateLimiter, auth, JobController.getJobById);
router.patch("/:jobId", apiRateLimiter, auth, JobController.updateJobReviewStatus);
router.patch("/:jobId/pipeline", apiRateLimiter, auth, JobController.updatePipelineConfig);
router.get("/:jobId/applications", apiRateLimiter, auth, ApplicationController.listApplicationsByJob);
router.get("/:jobId/stats", apiRateLimiter, auth, ApplicationController.getPipelineStats);

export default router;
