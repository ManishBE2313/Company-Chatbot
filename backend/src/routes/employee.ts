import express from "express";
import { apiRateLimiter } from "../middlewares/rateLimiter";

import { ApplicationController } from "../controllers/application";
import { EmployeeController } from "../controllers/EmployeeController";
import { TimesheetController } from "../controllers/timesheetController";
import { isHR } from "../middlewares/isHR";
import { auth } from "../middlewares/auth";
import { employeeAuth } from "../middlewares/employeeAuth";

const router = express.Router();
router.get("/me", employeeAuth, EmployeeController.getMyProfile);
router.post("/create", EmployeeController.createEmployee);
router.get("/", auth, isHR, EmployeeController.getAllEmployees);
router.get("/details", employeeAuth, EmployeeController.getEmployeeByEmail);
router.put("/update/:id", employeeAuth, EmployeeController.updateEmployee);
router.post("/:id/timesheet", employeeAuth, TimesheetController.createTimesheet);
router.get("/:id/timesheet", employeeAuth, TimesheetController.getTimesheetsForEmployee);
router.delete("/:id", auth, isHR, EmployeeController.deleteEmployee);

export default router;