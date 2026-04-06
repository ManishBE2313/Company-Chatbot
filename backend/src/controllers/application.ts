import { Response, NextFunction } from "express";
import { ApplicationService } from "../services/application";
import { validateQueryParams, QueryValidationRules } from "../utils/validation";
import { eventBus } from "../events/eventBus";
import { EVENTS } from "../events/events";
import { InterviewRepository } from "../repositories/InterviewRepository";

const APPLICATION_STATUSES = [
  "PENDING",
  "SCREENED",
  "SCHEDULING",
  "SCHEDULED",
  "EVALUATING",
  "OFFERED",
  "REJECTED",
  "WITHDRAWN",
];

export class ApplicationController {
  public static async listAllApplications(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        jobId: { type: "uuid", required: false },
        status: { type: "enum", required: false, values: APPLICATION_STATUSES },
      };

      validateQueryParams(req.query, validationRules);

      const applications = await ApplicationService.listAllApplications({
        jobId: req.query.jobId,
        status: req.query.status,
      });

      res.status(200).json({
        data: applications,
        meta: {
          filter: {
            jobId: req.query.jobId ?? null,
            status: req.query.status ?? null,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async listApplicationsByJob(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        jobId: { type: "uuid", required: true },
        status: { type: "enum", required: false, values: APPLICATION_STATUSES },
      };

      validateQueryParams({ ...req.params, ...req.query }, validationRules);

      const result = await ApplicationService.listApplicationsByJob(req.params.jobId, req.query.status);

      res.status(200).json({
        data: result.applications,
        meta: {
          jobId: result.job.id,
          filter: {
            status: req.query.status ?? null,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getPipelineStats(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        jobId: { type: "uuid", required: true },
      };

      validateQueryParams(req.params, validationRules);

      const stats = await ApplicationService.getPipelineStats(req.params.jobId);
      res.status(200).json({ data: stats });
    } catch (error) {
      next(error);
    }
  }

  public static async getApplicationById(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        applicationId: { type: "uuid", required: true },
      };

      validateQueryParams(req.params, validationRules);

      const application = await ApplicationService.getApplicationById(req.params.applicationId);
      res.status(200).json({ data: application });
    } catch (error) {
      next(error);
    }
  }

  public static async updateApplicationStatus(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        applicationId: { type: "uuid", required: true },
        status: { type: "enum", required: true, values: APPLICATION_STATUSES },
      };

      validateQueryParams({ ...req.params, ...req.body }, validationRules);

      const application = await ApplicationService.overrideApplicationStatus(
        req.params.applicationId,
        req.body.status
      );
      eventBus.emit(EVENTS.APPLICATION_UPDATED, {applicationId: application.id,});

      res.status(200).json({
        message: "Application status updated successfully.",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createScorecard(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        interviewId: { type: "uuid", required: true },
        interviewerId: { type: "uuid", required: true },
        technicalScore: { type: "number", required: true },
        communicationScore: { type: "number", required: true },
        recommendation: {
          type: "enum",
          required: true,
          values: ["STRONG_HIRE", "HIRE", "HOLD", "NO_HIRE"],
        },
        notes: { type: "string", required: false },
      };

      validateQueryParams(req.body, validationRules);

      const scorecard = await ApplicationService.createScorecard(req.body);
      const interview = await InterviewRepository.findById(req.body.interviewId);

      eventBus.emit(EVENTS.SCORE_ADDED, {applicationId: interview?.applicationId,});
      res.status(201).json({
        message: "Scorecard submitted successfully",
        data: scorecard,
      });
    } catch (error) {
      next(error);
    }
  }
}
