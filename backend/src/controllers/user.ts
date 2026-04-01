import { Response, NextFunction } from "express";
import { CatalogService, UserService } from "../services/user";
import { validateQueryParams, QueryValidationRules, lengthsOfFields } from "../utils/validation";
import Errors from "../errors";

export class UserController {
  public static async upsertUser(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        email: { type: "string", required: true, max: lengthsOfFields.email },
        firstName: { type: "string", required: false, max: lengthsOfFields.firstName },
        lastName: { type: "string", required: false, max: lengthsOfFields.lastName },
      };

      validateQueryParams(req.body, validationRules);

      const result = await UserService.syncUserLogin(req.body);

      res.status(result.created ? 201 : 200).json({
        data: {
          email: result.user.email,
          role: result.user.role,
          lastLoginAt: result.user.lastLoginAt,
          created: result.created,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getRole(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        email: { type: "string", required: true, max: lengthsOfFields.email },
      };

      validateQueryParams(req.query, validationRules);
      const role = await UserService.getUserRoleByEmail(req.query.email);

      res.status(200).json({
        data: {
          email: req.query.email,
          role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getEligibleInterviewers(req: any, res: Response, next: NextFunction) {
    try {
      const interviewers = await UserService.getEligibleInterviewers();
      res.status(200).json({ success: true, data: interviewers });
    } catch (err) {
      next(err);
    }
  }

  public static async listEmployees(req: any, res: Response, next: NextFunction) {
    try {
      const employees = await UserService.listEmployeesWithRoles();
      res.status(200).json({ data: employees });
    } catch (error) {
      next(error);
    }
  }

  public static async listRoles(req: any, res: Response, next: NextFunction) {
    try {
      const roles = await UserService.listAssignableRoles();
      res.status(200).json({ data: roles });
    } catch (error) {
      next(error);
    }
  }

  public static async updateEmployeeRoles(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        userId: { type: "uuid", required: true },
        roles: { type: "string[]", required: true },
      };

      validateQueryParams({ ...req.params, ...req.body }, validationRules);

      const actingUserEmail = typeof req.headers["x-user-email"] === "string"
        ? req.headers["x-user-email"].trim()
        : "";

      if (!actingUserEmail) {
        throw new Errors.BadRequestError("x-user-email header is required.");
      }

      const updated = await UserService.updateEmployeeRoles(
        req.params.userId,
        req.body.roles,
        actingUserEmail
      );

      res.status(200).json({
        message: "Employee roles updated successfully.",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export class CatalogController {
  public static async getJobCreationCatalog(_req: any, res: Response, next: NextFunction) {
    try {
      const catalog = await CatalogService.getJobCreationCatalog();
      res.status(200).json({ data: catalog });
    } catch (error) {
      next(error);
    }
  }
}
