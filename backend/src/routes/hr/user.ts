import { Router } from "express";
import { UserController } from "../../controllers/user";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/upsert", UserController.upsertUser);
router.get("/role", UserController.getRole);
router.get(
  "/interviewers", 
  auth, 
  UserController.getEligibleInterviewers
);
export default router;
