import { Request, Response, NextFunction } from "express";
import { validateQueryParams, QueryValidationRules } from "../../utils/validation";
import { UserResponseService } from "../../services/survey/user_response";

export class UserResponseController {

  // helper to extract + validate identity
  private static getIdentity(req: Request) {
    const employeeId =
      (req as Request & { user?: { id: string } }).user?.id || null;

    const anonymousToken =
      (req as Request & { anonymousToken?: string }).anonymousToken || null;

    if (!employeeId && !anonymousToken) {
      throw new Error("User not identified");
    }

    if (employeeId && anonymousToken) {
      throw new Error("Invalid request: both employee and anonymous token present");
    }

    return { employeeId, anonymousToken };
  }

  static async getUserSurveys(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, anonymousToken } = this.getIdentity(req);

      const surveys = await UserResponseService.getUserSurveys(
        employeeId,
        anonymousToken
      );

      res.status(200).json({ data: surveys });

    } catch (error) {
      next(error);
    }
  }

  static async getSurvey(req: Request, res: Response, next: NextFunction) {
    try {

      const validationRules: QueryValidationRules = {
        surveyId: { type: "uuid", required: true }
      };

      validateQueryParams(req.params, validationRules);

      const { employeeId, anonymousToken } = this.getIdentity(req);

      const survey = await UserResponseService.getSurvey(
        employeeId,
        req.params.surveyId as string,
        anonymousToken
      );

      res.status(200).json({ data: survey });

    } catch (error) {
      next(error);
    }
  }


  static async submitResponse(req: Request, res: Response, next: NextFunction) {
    try {

      const paramRules: QueryValidationRules = {
        surveyId: { type: "uuid", required: true }
      };

      const bodyRules: QueryValidationRules = {
        answers: { type: "array", required: true }
      };

      validateQueryParams(req.params, paramRules);
      validateQueryParams(req.body, bodyRules);

      const answers = req.body.answers;

      if (!Array.isArray(answers) || !answers.length) {
        throw new Error("answers must not be empty");
      }

      // duplicate question check
      const questionIds = answers.map((a: any) => a.questionId);
      if (new Set(questionIds).size !== questionIds.length) {
        throw new Error("Duplicate answers for same question");
      }

      // validate each answer
      answers.forEach((a: any) => {

        validateQueryParams(a, {
          questionId: { type: "uuid", required: true }
        });

        if (!a.optionId && !a.text && a.rating === undefined) {
          throw new Error("Each answer must have optionId, text, or rating");
        }

        if (
          Number(!!a.optionId) +
          Number(!!a.text) +
          Number(a.rating !== undefined) !== 1
        ) {
          throw new Error("Only one answer type allowed per question");
        }

        if (a.optionId) {
          validateQueryParams(a, {
            optionId: { type: "uuid" }
          });
        }

        if (a.text) {
          validateQueryParams(a, {
            text: { type: "string", min: 1, max: 1000 }
          });
        }

        if (a.rating !== undefined) {
          if (
            typeof a.rating !== "number" ||
            a.rating < 1 ||
            a.rating > 5
          ) {
            throw new Error("rating must be between 1 and 5");
          }
        }
      });

      const { employeeId, anonymousToken } = this.getIdentity(req);

      const response = await UserResponseService.submitResponse(
        employeeId,
        req.params.surveyId as string,
        answers,
        anonymousToken
      );

      res.status(201).json({
        message: "Response submitted successfully",
        data: response
      });

    } catch (error) {
      next(error);
    }
  }
}