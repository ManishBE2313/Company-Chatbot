import { Router } from "express";
import { ApplicationController } from "../../controllers/application";
import { auth } from "../../middlewares/auth";
import { apiRateLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.get("/",  auth, ApplicationController.listAllApplications);
router.get("/:applicationId", auth, ApplicationController.getApplicationById);
router.patch("/:applicationId/status", auth, ApplicationController.updateApplicationStatus);

export default router;
