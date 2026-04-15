import { Router } from "express";
import { InterviewController } from "../controllers/interview";
import { auth } from "../middlewares/auth";

const router = Router();

router.get("/me", auth, InterviewController.getMyInterviews);
router.get("/scheduled", auth, InterviewController.getScheduledInterviewsBoard);

export default router;
