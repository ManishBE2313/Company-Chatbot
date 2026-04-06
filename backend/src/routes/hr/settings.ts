import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { apiRateLimiter } from "../../middlewares/rateLimiter";
import { SettingsController } from "../../controllers/settings";

const router = Router();

router.get("/skills", apiRateLimiter, auth, SettingsController.listSkills);
router.post("/skills", apiRateLimiter, auth, SettingsController.createSkill);
router.get("/job-descriptions", apiRateLimiter, auth, SettingsController.listJobDescriptionTemplates);
router.post("/job-descriptions", apiRateLimiter, auth, SettingsController.createJobDescriptionTemplate);
router.post("/job-descriptions/analyze", apiRateLimiter, auth, SettingsController.analyzeJobDescription);
router.post("/suggest", apiRateLimiter, auth, SettingsController.suggestText);

export default router;
