import { Response, NextFunction } from "express";
import { ApplicationService } from "../services/application";
import { validateQueryParams, QueryValidationRules } from "../utils/validation";
import { PipelineService } from "../services/pipeline";
import { InterviewRepository } from "../repositories/InterviewRepository";
import { eventBus } from "../events/eventBus";
import { EVENTS } from "../events/events";

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

      const actingUserEmail = typeof req.headers["x-user-email"] === "string"
        ? req.headers["x-user-email"]
        : null;

      // 1. Create the Scorecard
      const scorecard = await ApplicationService.createScorecard(req.body, actingUserEmail);
      
      // 2. Fetch the associated Interview
      const interview = await InterviewRepository.findById(req.body.interviewId);

      if (interview) {
        // GUARANTEE 1: Instantly mark the current interview as COMPLETED so it never repeats.
        await interview.update({ status: "COMPLETED" });

        const isPositiveHire = req.body.recommendation === "HIRE" || req.body.recommendation === "STRONG_HIRE";
        
        // Fetch the application and job to check the pipeline configuration
        const { ApplicationRepository } = await import("../repositories/application");
        const application = await ApplicationRepository.findApplicationById(interview.applicationId);
        const pipelineConfig = application?.job?.pipelineConfig || [];
        
        // Find where we currently are in the pipeline
        const currentStageIndex = pipelineConfig.findIndex((stage: any) => stage.name === interview.roundName);
        const hasNextRound = currentStageIndex !== -1 && currentStageIndex < pipelineConfig.length - 1;

        if (isPositiveHire && hasNextRound) {
          // GUARANTEE 2: Grab the EXACT NEXT stage from the pipeline
          const nextStage = pipelineConfig[currentStageIndex + 1];
          
          // GUARANTEE 3: Hard-update the database so it physically moves to the new stage
          await application.update({ 
            status: "SCHEDULING",
            currentStage: nextStage.name 
          }); 
          
          // Log the transition in the history
          await PipelineService.transitionState(
            interview.applicationId,
            "SCHEDULING",
            scorecard.interviewerId,
            `Passed ${interview.roundName}. Auto-advancing to ${nextStage.name}.`
          );
        } else {
          // If it's the LAST stage, or if they got "NO_HIRE"/"HOLD", stop scheduling and move to EVALUATING
          await PipelineService.transitionState(
            interview.applicationId,
            "EVALUATING",
            scorecard.interviewerId,
            `Scorecard Submitted: ${req.body.recommendation}. Pipeline finished or candidate on hold.`
          );
        }
        eventBus.emit(EVENTS.SCORE_ADDED, {
    applicationId: interview.applicationId,
  });

      }

      res.status(201).json({
        message: "Scorecard processed and pipeline updated successfully.",
        data: scorecard,
      });
    } catch (error) {
      next(error);
    }
  }
}