import { Response, NextFunction } from "express";
import { CandidateService } from "../services/candidate";
import { validateQueryParams, QueryValidationRules, lengthsOfFields } from "../utils/validation";

export class CandidateController {
  public static async uploadCV(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        jobId: { type: "uuid", required: true },
        firstName: { type: "string", required: true, max: lengthsOfFields.firstName },
        lastName: { type: "string", required: true, max: lengthsOfFields.lastName },
        email: { type: "string", required: true, max: lengthsOfFields.email },
        resumeUrl: { type: "string", required: true, max: 255 },
      };

      validateQueryParams(req.body, validationRules);

      const result = await CandidateService.processCVUpload(req.body);

      res.status(201).json({
        message: "CV uploaded successfully. AI screening initiated.",
        data: {
          candidateId: result.candidate.id,
          applicationId: result.application.id,
          status: result.application.status,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
