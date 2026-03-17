import { Response, NextFunction } from "express";
import { JobService } from "../services/job";
import { validateQueryParams, QueryValidationRules, lengthsOfFields } from "../utils/validation";

export class JobController {
  /**
   * Handles the creation of a new Job and its Criteria.
   */
  public static async createJob(req: any, res: Response, next: NextFunction) {
    try {
      // 1. Define strict validation rules based on your existing utility
      const validationRules: QueryValidationRules = {
        title: { type: "string", required: true, max: lengthsOfFields.title },
        department: { type: "string", required: true, max: lengthsOfFields.generic },
        location: { type: "string", required: true, max: lengthsOfFields.cityName },
        headcount: { type: "number", required: true, min: 1 },
        requirements: { type: "object", required: true },
      };

      // 2. Validate the incoming request body
      // If validation fails, this will throw a BadRequestError which your global error handler catches
      validateQueryParams(req.body, validationRules);

      // 3. Pass the clean, validated data to the Service layer
      const result = await JobService.createJobWithCriteria(req.body);

      // 4. Return a successful response to the client
      res.status(201).json({
        message: "Job created successfully. AI target generation initiated.",
        data: {
          jobId: result.job.id,
          title: result.job.title,
          status: result.job.status,
        },
      });
    } catch (err) {
      // Pass any errors (like validation or database errors) to your global Express error handler
      next(err);
    }
  }
}