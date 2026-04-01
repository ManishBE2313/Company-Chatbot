import { Request, Response, NextFunction } from "express";
import { TimesheetService } from "../services/timesheetService";

export class TimesheetController {
  public static async createTimesheet(req: Request, res: Response, next: NextFunction) {
    try {
      const rawEmployeeId = req.params.id;
      const employeeId = Array.isArray(rawEmployeeId) ? rawEmployeeId[0] : rawEmployeeId;
      const payload = req.body;

      if (!employeeId || !payload) {
        return res.status(400).json({ message: "Invalid request" });
      }

      const result = await TimesheetService.saveTimesheet(decodeURIComponent(employeeId), payload);
      return res.status(201).json({ message: "Timesheet saved", data: result });
    } catch (error: any) {
      console.error("Timesheet save error", error);
      if (error.message === "Employee not found") {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  public static async getTimesheetsForEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const rawEmployeeId = req.params.id;
      const employeeId = Array.isArray(rawEmployeeId) ? rawEmployeeId[0] : rawEmployeeId;
      const employee = await TimesheetService.getTimesheetByEmployeeEmail(decodeURIComponent(employeeId));

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.status(200).json({ data: employee });
    } catch (error) {
      next(error);
    }
  }
}
