import { Request, Response, NextFunction } from "express";
import { SurveyService } from "../../services/survey/create_survey";
import { validateQueryParams, QueryValidationRules } from "../../utils/validation";
import { UUID } from "node:crypto";

const SURVEY_STATUS = ["UPCOMING", "ACTIVE", "EXPIRED"];

export class SurveyController {
  static async createSurvey(req: Request, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        title: { type: "string", required: true, min: 3, max: 255 },
        surveyType: {
          type: "enum",
          values: ["ATTRIBUTED", "ANONYMOUS"],
          default: "ATTRIBUTED",
        },
        startAt: { type: "date", required: true },
        endAt: { type: "date", required: true },
        questions: { type: "array", required: true },
        departmentIds: { type: "array", required: false },
        isForAllDepartments: { type: "boolean", required: false },
      };

      validateQueryParams(req.body, validationRules);

      const start = new Date(req.body.startAt);
      const end = new Date(req.body.endAt);

      if (start >= end) {
        throw new Error("startAt must be before endAt");
      }
      const isForAll = req.body.isForAllDepartments ?? false;
      const departmentIds = req.body.departmentIds;

      if (isForAll && departmentIds?.length) {
        throw new Error("Cannot send departmentIds when isForAllDepartments is true");
      }

      if (!isForAll && (!departmentIds || departmentIds.length === 0)) {
        throw new Error("At least one department is required");
      }

      if (departmentIds) {
        const unique = new Set(departmentIds);

        if (unique.size !== departmentIds.length) {
          throw new Error("Duplicate departmentIds are not allowed");
        }
      }


      if (!Array.isArray(req.body.questions) || req.body.questions.length === 0) {
        throw new Error("At least one question is required");
      }

      req.body.questions.forEach((q: any) => {
        validateQueryParams(q, {
          questionText: { type: "string", required: true, min: 3, max: 255 },
          type: {
            type: "enum",
            required: true,
            values: ["rating", "text", "mcq"],
          },
        });

        if (q.type === "mcq") {
          validateQueryParams(q, {
            options: { type: "array", required: true, min: 2, max: 10 },
          });

          const texts = q.options.map((o: any) => o.text?.trim());

          if (texts.some((t: string) => !t)) {
            throw new Error("Option text cannot be empty");
          }

          if (new Set(texts).size !== texts.length) {
            throw new Error("Duplicate options are not allowed");
          }
        }
      });

      const survey = await SurveyService.createSurvey({
        ...req.body,
        isForAllDepartments: isForAll,
      });

      res.status(201).json({
        message: "Survey created successfully",
        data: survey,
      });
    } catch (error) {
      next(error);
    }
  }
  static async getSurveyById(req: Request, res: Response, next: NextFunction) {
    try {
      validateQueryParams(req.params, {
        id: { type: "uuid", required: true },
      });

      const survey = await SurveyService.getSurveyById(req.params.id as string);

      res.status(200).json({
        data: survey,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllSurveys(req: Request, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        status: { type: "enum", required: false, values: SURVEY_STATUS },
        page: { type: "number", required: false },
        limit: { type: "number", required: false },
        sortBy: {
          type: "enum",
          required: false,
          values: ["startAt", "endAt"],
        },
        order: {
          type: "enum",
          required: false,
          values: ["ASC", "DESC"],
        },
        departmentIds: { type: "string", required: false }, // comma-separated
      };

      validateQueryParams(req.query, validationRules);

      const result = await SurveyService.getAllSurveys({
        status: req.query.status as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        sortBy: (req.query.sortBy as string) || "startAt",
        order: (req.query.order as "ASC" | "DESC") || "DESC",
        departmentIds: req.query.departmentIds
          ? (req.query.departmentIds as string).split(",")
          : undefined,
      });

      res.status(200).json({
        data: result.rows,
        meta: {
          total: result.count,
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 10,
          filter: {
            status: req.query.status ?? null,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
  static async updateSurvey(req: Request, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        id: { type: "uuid", required: true },
        title: { type: "string", required: false, min: 3, max: 255 },
        surveyType: {
          type: "enum",
          required: false,
          values: ["ATTRIBUTED", "ANONYMOUS"],
        },
        startAt: { type: "date", required: false },
        endAt: { type: "date", required: false },
        questions: { type: "array", required: false },
        departmentIds: { type: "array", required: false },
        isForAllDepartments: { type: "boolean", required: false },
      };

      validateQueryParams({ ...req.params, ...req.body }, validationRules);


      if (req.body.isForAllDepartments && req.body.departmentIds?.length) {
        throw new Error("Cannot send departmentIds when isForAllDepartments is true");
      }

      if (
        req.body.isForAllDepartments === false &&
        (!req.body.departmentIds || req.body.departmentIds.length === 0)
      ) {
        throw new Error("At least one department is required");
      }

      if (req.body.departmentIds) {
        const unique = new Set(req.body.departmentIds);

        if (unique.size !== req.body.departmentIds.length) {
          throw new Error("Duplicate departmentIds are not allowed");
        }
      }

      if (req.body.questions) {
        req.body.questions.forEach((q: any) => {
          if (q.id) {
            validateQueryParams(q, {
              id: { type: "uuid", required: true },
              questionText: { type: "string", required: false, min: 3, max: 255 },
              type: {
                type: "enum",
                required: false,
                values: ["rating", "text", "mcq"],
              },
            });
          } else {
            validateQueryParams(q, {
              questionText: { type: "string", required: true, min: 3, max: 255 },
              type: {
                type: "enum",
                required: true,
                values: ["rating", "text", "mcq"],
              },
            });
          }

          if (q.type === "mcq") {
            validateQueryParams(q, {
              options: { type: "array", required: true, min: 2, max: 10 },
            });

            const texts = q.options.map((o: any) => o.text?.trim());

            if (texts.some((t: string) => !t)) {
              throw new Error("Option text cannot be empty");
            }

            if (new Set(texts).size !== texts.length) {
              throw new Error("Duplicate options are not allowed");
            }
          }
        });
      }

      const updated = await SurveyService.updateSurvey(
        req.params.id as UUID,
        req.body
      );

      res.status(200).json({
        message: "Survey updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}