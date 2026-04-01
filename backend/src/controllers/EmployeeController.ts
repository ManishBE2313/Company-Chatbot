import { Request, Response, NextFunction } from "express";
import  { EmployeeService } from "../services/employeeService";
import { EmployeeRepository } from "../repositories/employeeRepository";

export class EmployeeController {
// get my profile
 public static async getMyProfile(req: any, res: any) {
  try {
    const email = req.user.sub;

    const employee = await EmployeeRepository.findByWorkEmail(email);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    return res.json({
      data: employee,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}
  //  CREATE FULL EMPLOYEE
  public static async createEmployee(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    console.log("reached here")
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
  public static async getEmployeeByEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    
   const email = (req as any).user?.sub;
    if (!email) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
 
      
    
    
    try {
      const employee = await EmployeeService.getEmployeeByEmail(email);

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
      console.log("employee update request", {
        id,
        body: req.body,
      });
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
