import { Router } from "express";
import { ApplicationController } from "../../controllers/application";
import { auth } from "../../middlewares/auth";
import { apiRateLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.get("/", apiRateLimiter, auth, ApplicationController.listAllApplications);
router.get("/:applicationId", apiRateLimiter, auth, ApplicationController.getApplicationById);
router.patch("/:applicationId/status", apiRateLimiter, auth, ApplicationController.updateApplicationStatus);

export default router;
