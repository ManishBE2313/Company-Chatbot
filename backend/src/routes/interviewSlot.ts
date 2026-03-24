import { Router } from "express";
import { InterviewSlotController } from "../controllers/interviewSlot";
import { auth } from "../middlewares/auth";

const router = Router();

router.post("/", auth, InterviewSlotController.createSlot);
router.get("/me", auth, InterviewSlotController.getMySlots);
router.delete("/:id", auth, InterviewSlotController.deleteSlot);

export default router;
