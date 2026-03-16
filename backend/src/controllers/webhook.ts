import { Response, NextFunction } from "express";
import { CandidateRepository } from "../repositories/candidate";
import { validateQueryParams, QueryValidationRules } from "../utils/validation";
import { getTransaction } from "../config/database";
import { Transaction } from "sequelize";
import Errors from "../errors";

export class WebhookController {
  public static async processAiResult(req: any, res: Response, next: NextFunction) {
    let transaction: Transaction | undefined;
    try {
      const validationRules: QueryValidationRules = {
        candidateId: { type: "uuid", required: true },
        status: { type: "enum", values: ["Passed", "Rejected"], required: true },
        aiScore: { type: "number", required: true, min: 0, max: 100 },
      };

      validateQueryParams(req.body, validationRules);

      const { candidateId, status, aiScore, aiTags, aiReasoning } = req.body;

      if (aiTags !== undefined && !Array.isArray(aiTags) && (typeof aiTags !== "object" || aiTags === null)) {
        throw new Errors.BadRequestError("aiTags must be an array or object when provided.");
      }

      if (aiReasoning !== undefined && aiReasoning !== null && typeof aiReasoning !== "string") {
        throw new Errors.BadRequestError("aiReasoning must be a string when provided.");
      }

      transaction = await getTransaction();

      const candidate = await CandidateRepository.findCandidateById(candidateId, transaction);
      if (!candidate) {
        throw new Errors.BadRequestError("Candidate not found for the supplied candidateId.");
      }

      const affectedCount = await CandidateRepository.updateCandidate(
        candidateId,
        {
          status,
          aiScore,
          aiTags,
          aiReasoning,
        },
        transaction
      );

      if (!affectedCount) {
        throw new Errors.SystemError("Candidate AI evaluation could not be updated.");
      }

      await transaction.commit();

      res.status(200).json({ message: "Candidate AI evaluation updated successfully." });
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      next(err);
    }
  }
}
