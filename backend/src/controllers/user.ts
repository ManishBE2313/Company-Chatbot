import { Response, NextFunction } from "express";
import { UserService } from "../services/user";
import { validateQueryParams, QueryValidationRules, lengthsOfFields } from "../utils/validation";

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
}
