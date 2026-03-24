import { Request, Response, NextFunction } from "express";
import  { EmployeeService } from "../services/employeeService";

export class EmployeeController {

  //  CREATE FULL EMPLOYEE
  public static async createEmployee(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const employee = await EmployeeService.createEmployee(req.body);

      res.status(201).json({
        message: "Employee created successfully",
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  //  GET ALL EMPLOYEES
  public static async getAllEmployees(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const employees = await EmployeeService.getAllEmployees();

      res.status(200).json({
        data: employees,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET SINGLE EMPLOYEE (FULL DETAILS)
  public static async getEmployeeById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const id = req.params.id as string;
    try {
      const employee = await EmployeeService.getEmployeeById(id);

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      res.status(200).json({
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  // UPDATE EMPLOYEE
  public static async updateEmployee(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
        const id = req.params.id as string;
      const updated = await EmployeeService.updateEmployee(
        id,
        req.body
      );

      res.status(200).json({
        message: "Employee updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE EMPLOYEE
  public static async deleteEmployee(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
        const id = req.params.id as string;
      await EmployeeService.deleteEmployee(id);

      res.status(200).json({
        message: "Employee deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}