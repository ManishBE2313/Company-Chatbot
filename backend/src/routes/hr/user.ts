import { Router } from "express";
import { UserController } from "../../controllers/user";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/upsert", UserController.upsertUser);
router.get("/role", UserController.getRole);
router.get("/interviewers", auth, UserController.getEligibleInterviewers);
router.get("/employees", auth, UserController.listEmployees);
router.get("/roles", auth, UserController.listRoles);
router.put("/:userId/roles", auth, UserController.updateEmployeeRoles);

export default router;
