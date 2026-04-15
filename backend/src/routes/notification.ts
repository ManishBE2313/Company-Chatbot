
import { Router } from "express";
import { NotificationController } from "../controllers/notification";

const router = Router();

router.post("/interview-scheduled", NotificationController.sendInterviewScheduled);
router.post("/reschedule", NotificationController.sendReschedule);
router.post("/scorecard-reminder", NotificationController.sendScorecardReminder);
// SharePoint Grant Request
router.post("/sharepoint-grant", NotificationController.sendSharepointGrantRequest);
export default router;
