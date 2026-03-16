import { Response, NextFunction } from "express";
import { CandidateService } from "../services/candidate";
import { validateQueryParams, QueryValidationRules, lengthsOfFields } from "../utils/validation"; // Adjust path

export class CandidateController {
  public static async uploadCV(req: any, res: Response, next: NextFunction) {
    try {
      // req.data usually holds context from auth middleware in your setup
      //let schemaCompanyId = req.data.companyId;

      // 1. Define strict validation rules based on your validation.ts
      const validationRules: QueryValidationRules = {
        jobId: { type: "uuid", required: true },
        firstName: { type: "string", required: true, max: lengthsOfFields.firstName },
        lastName: { type: "string", required: true, max: lengthsOfFields.lastName },
        email: { type: "string", required: true, max: lengthsOfFields.email },
        resumeUrl: { type: "string", required: true, max: 255 },
      };

      // 2. Validate incoming body
      validateQueryParams(req.body, validationRules);

      // 3. Process the upload
      const candidate = await CandidateService.processCVUpload(
        req.body
      );

      res.status(201).json({ 
        message: "CV uploaded successfully. AI screening initiated.",
        data: {
          candidateId: candidate.id,
          status: candidate.status
        }
      });
    } catch (err) {
      next(err);
    }
  }
}