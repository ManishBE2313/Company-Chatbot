import { Response, NextFunction } from "express";
import { JobService } from "../services/job";
import { validateQueryParams, QueryValidationRules, lengthsOfFields } from "../utils/validation";

export class JobController {
  public static async createJob(req: any, res: Response, next: NextFunction) {
     console.log("rechedheree 0")
    try {
      const validationRules: QueryValidationRules = {
        title: { type: "string", required: true, max: lengthsOfFields.title },
        department: { type: "string", required: true, max: lengthsOfFields.generic },
        location: { type: "string", required: true, max: lengthsOfFields.cityName },
        headcount: { type: "number", required: true, min: 1 },
        requirements: { type: "object", required: true },
      };

      validateQueryParams(req.body, validationRules);
  console.log("rechedheree 1")
      const result = await JobService.createJobWithCriteria(req.body);
      console.log("reachedhere 2")

      res.status(201).json({
        message: "Job created successfully. AI target generation initiated.",
        data: {
          jobId: result.job.id,
          title: result.job.title,
          status: result.job.status,
        },
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
      };

      validateQueryParams(req.query, validationRules);

      const result = await JobService.listJobsForHR(req.query.status);

      res.status(200).json({
        data: result.jobs,
        meta: {
          total: result.total,
          statusCounts: result.statusCounts,
          filter: {
            status: req.query.status ?? null,
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
}
