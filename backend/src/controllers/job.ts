import { Response, NextFunction } from "express";
import { JobService } from "../services/job";
import { validateQueryParams, QueryValidationRules, lengthsOfFields } from "../utils/validation";
import Errors from "../errors";

export class JobController {
  public static async createJob(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        title: { type: "string", required: false, max: lengthsOfFields.title },
        department: { type: "string", required: false, max: lengthsOfFields.generic },
        departmentId: { type: "uuid", required: false },
        location: { type: "string", required: false, max: lengthsOfFields.cityName },
        locationId: { type: "uuid", required: false },
        jobRoleId: { type: "uuid", required: false },
        panelId: { type: "uuid", required: false },
        headcount: { type: "number", required: true, min: 1 },
        employmentType: { type: "enum", required: false, values: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"] },
        workModel: { type: "enum", required: false, values: ["ON_SITE", "REMOTE", "HYBRID"] },
        seniorityLevel: { type: "string", required: false, max: lengthsOfFields.generic },
        experienceMin: { type: "number", required: false, min: 0 },
        experienceMax: { type: "number", required: false, min: 0 },
        salaryMin: { type: "number", required: false, min: 0 },
        salaryMax: { type: "number", required: false, min: 0 },
        currency: { type: "string", required: false, max: 10 },
        payFrequency: { type: "enum", required: false, values: ["HOURLY", "WEEKLY", "MONTHLY", "YEARLY"] },
        salaryVisibility: { type: "enum", required: false, values: ["PUBLIC", "INTERNAL", "HIDDEN"] },
        requirements: { type: "object", required: true },
      };

      validateQueryParams(req.body, validationRules);

      if (!req.body.title && !req.body.jobRoleId) {
        throw new Errors.BadRequestError("Either title or jobRoleId is required.");
      }

      const actingUserEmail = typeof req.headers["x-user-email"] === "string"
        ? req.headers["x-user-email"].trim()
        : null;

      const result = await JobService.createJobWithCriteria(req.body, actingUserEmail);

      res.status(201).json({
        message: "Job created successfully. AI target generation initiated.",
        data: result.job,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listJobs(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        status: {
          type: "enum",
          required: false,
          values: ["Draft", "Open", "Paused", "Closed"],
        },
        reviewStatus: {
          type: "enum",
          required: false,
          values: ["approved", "needs_review", "blocked"],
        },
      };

      validateQueryParams(req.query, validationRules);

      const result = await JobService.listJobsForHR(req.query.status, req.query.reviewStatus);

      res.status(200).json({
        data: result.jobs,
        meta: {
          total: result.total,
          statusCounts: result.statusCounts,
          filter: {
            status: req.query.status ?? null,
            reviewStatus: req.query.reviewStatus ?? null,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getJobById(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        jobId: { type: "uuid", required: true },
      };

      validateQueryParams(req.params, validationRules);

      const job = await JobService.getJobForHR(req.params.jobId);

      res.status(200).json({ data: job });
    } catch (err) {
      next(err);
    }
  }

  public static async updateJobReviewStatus(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        jobId: { type: "uuid", required: true },
        status: { type: "enum", required: true, values: ["Draft", "Open", "Paused", "Closed"] },
        reviewStatus: { type: "enum", required: true, values: ["approved", "needs_review", "blocked"] },
      };

      validateQueryParams({ ...req.params, ...req.body }, validationRules);

      const job = await JobService.updateJobReviewStatus(
        req.params.jobId,
        req.body.status,
        req.body.reviewStatus
      );

      res.status(200).json({
        message: "Job review updated successfully.",
        data: job,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updatePipelineConfig(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        jobId: { type: "uuid", required: true },
        pipelineConfig: { type: "array", required: true },
      };

      validateQueryParams({ ...req.params, ...req.body }, validationRules);

      const pipelineConfig = req.body.pipelineConfig as any[];

      for (const [index, stage] of pipelineConfig.entries()) {
        if (!stage || typeof stage !== "object" || Array.isArray(stage)) {
          throw new Error(`pipelineConfig[${index}] must be an object.`);
        }

        if (typeof stage.name !== "string" || stage.name.trim().length === 0) {
          throw new Error(`pipelineConfig[${index}].name is required.`);
        }
      }

      const job = await JobService.updatePipelineConfig(req.params.jobId, pipelineConfig);

      res.status(200).json({
        message: "Pipeline configuration updated successfully.",
        data: job,
      });
    } catch (err) {
      next(err);
    }
  }
}
