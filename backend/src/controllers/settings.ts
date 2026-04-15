import { Response, NextFunction } from "express";
import { SettingsService } from "../services/settings";
import { validateQueryParams, QueryValidationRules, lengthsOfFields } from "../utils/validation";

export class SettingsController {
  public static async listSkills(_req: any, res: Response, next: NextFunction) {
    try {
      const skills = await SettingsService.listSkills();
      res.status(200).json({ data: skills });
    } catch (error) {
      next(error);
    }
  }

  public static async createSkill(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        name: { type: "string", required: true, max: lengthsOfFields.name },
        category: { type: "string", required: true, max: lengthsOfFields.generic },
      };

      validateQueryParams(req.body, validationRules);
      const skill = await SettingsService.createSkill(req.body);
      res.status(201).json({ data: skill });
    } catch (error) {
      next(error);
    }
  }

  public static async listJobDescriptionTemplates(_req: any, res: Response, next: NextFunction) {
    try {
      const templates = await SettingsService.listJobDescriptionTemplates();
      res.status(200).json({ data: templates });
    } catch (error) {
      next(error);
    }
  }

  public static async analyzeJobDescription(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        title: { type: "string", required: true, max: lengthsOfFields.title },
        description: { type: "string", required: true, max: lengthsOfFields.description },
      };

      validateQueryParams(req.body, validationRules);
      const result = await SettingsService.analyzeJobDescription(req.body);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  public static async suggestText(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        input: { type: "string", required: true, max: lengthsOfFields.description },
        kind: { type: "enum", required: false, values: ["skill", "description"] },
      };

      validateQueryParams(req.body, validationRules);
      const result = await SettingsService.suggestText(req.body);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  public static async createJobDescriptionTemplate(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        title: { type: "string", required: true, max: lengthsOfFields.title },
        jobRoleId: { type: "uuid", required: false },
        description: { type: "string", required: true, max: lengthsOfFields.description },
        refinedDescription: { type: "string", required: false, max: lengthsOfFields.description },
        mustHaveSkillIds: { type: "uuid[]", required: false },
        niceToHaveSkillIds: { type: "uuid[]", required: false },
      };

      validateQueryParams(req.body, validationRules);
      const template = await SettingsService.createJobDescriptionTemplate(req.body);
      res.status(201).json({ data: template });
    } catch (error) {
      next(error);
    }
  }
}
