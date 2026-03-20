import { Router } from "express";
import { InterviewSlotController } from "../controllers/interviewSlot";


const router = Router();


router.post(
 "/",
 InterviewSlotController.createSlot
);




router.get(
 "/me",
 InterviewSlotController.getMySlots
);


router.delete(
 "/:id",
 InterviewSlotController.deleteSlot
);


export default router;
