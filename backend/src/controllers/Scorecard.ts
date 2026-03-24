import { Response, NextFunction } from "express";
import { ApplicationService } from "../services/application";
import { validateQueryParams, QueryValidationRules } from "../utils/validation";
import { PipelineService } from "../services/pipeline";
import { InterviewRepository } from "../repositories/InterviewRepository";

export class ScorecardController {
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

      if (interview) {
        await PipelineService.transitionState(
          interview.applicationId,
          "EVALUATING",
          req.body.interviewerId,
          `Scorecard Submitted: ${req.body.recommendation}`
        );
      }

      res.status(201).json({
        message: "Scorecard submitted successfully. Application moved to Evaluating.",
        data: scorecard,
      });
    } catch (error) {
      next(error);
    }
  }
}
