import { Router } from "express";
import { UserController } from "../../controllers/user";

const router = Router();

router.post("/upsert", UserController.upsertUser);
router.get("/role", UserController.getRole);

export default router;
