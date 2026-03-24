import express from "express";
import { apiRateLimiter } from "../../middlewares/rateLimiter";
import auth from "../auth";
import { ApplicationController } from "../../controllers/application";
import { EmployeeController } from "../../controllers/EmployeeController";


const router = express.Router();

router.post("/", auth, isHR, EmployeeController.createEmployee);
router.get("/", auth, isHR, EmployeeController.getAllEmployees);
router.get("/:id", auth, isHR, EmployeeController.getEmployeeById);
router.put("/:id", auth, isHR, EmployeeController.updateEmployee);
router.delete("/:id", auth, isHR, EmployeeController.deleteEmployee);

export default router;