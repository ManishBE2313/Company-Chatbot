import { Transaction } from "sequelize";
import { sequelize } from "../../config/database";

import { UserResponseRepository } from "../../repositories/survey/user_response";

type UUID = string;

type SubmitAnswerDTO = {
  questionId: UUID;
  optionId?: UUID;
  text?: string;
  rating?: number;
};

type CreateAnswerDTO = {
  responseId: UUID;
  questionId: UUID;
  optionId?: UUID;
  text?: string;
  rating?: number;
};

export class UserResponseService {

  // ✅ GET ALL SURVEYS WITH STATUS
  static async getUserSurveys(
    employeeId: UUID | null,
    anonymousToken: string | null
  ) {

    const surveys = await UserResponseRepository.getAllSurveys();

    const responses = await UserResponseRepository.getUserResponses(
      employeeId,
      anonymousToken
    );

    const submittedSurveyIds = new Set(
      responses.map((r: any) => r.surveyId)
    );

    const now = new Date();

    return surveys.map((s: any) => {

      const isSubmitted = submittedSurveyIds.has(s.id);

      let status = "ACTIVE";

      if (isSubmitted) {
        status = "SUBMITTED";
      } else if (s.endAt && new Date(s.endAt) < now) {
        status = "EXPIRED";
      }

      return {
        ...s.toJSON(),
        status
      };
    });
  }

  // ✅ GET SINGLE SURVEY
  static async getSurvey(
    employeeId: UUID | null,
    surveyId: UUID,
    anonymousToken: string | null
  ) {

    const survey = await UserResponseRepository.getSurveyById(surveyId);

    if (!survey) {
      throw new Error("Survey not found");
    }

    let alreadySubmitted = false;

    if (employeeId) {
      const existing = await UserResponseRepository.findResponse(
        employeeId,
        surveyId
      );
      alreadySubmitted = !!existing;
    } else if (anonymousToken) {
      const existing = await UserResponseRepository.findAnonymousResponse(
        anonymousToken,
        surveyId
      );
      alreadySubmitted = !!existing;
    }

    return {
      ...survey.toJSON(),
      alreadySubmitted
    };
  }

  // ✅ SUBMIT RESPONSE
  static async submitResponse(
    employeeId: UUID | null,
    surveyId: UUID,
    answers: SubmitAnswerDTO[],
    anonymousToken: string | null
  ) {

    const survey = await UserResponseRepository.getSurveyById(surveyId);

    if (!survey) {
      throw new Error("Survey not found");
    }

    const surveyType = survey.get("surveyType") as "ATTRIBUTED" | "ANONYMOUS";

    // 🔥 ATTRIBUTED
    if (surveyType === "ATTRIBUTED") {

      if (!employeeId) {
        throw new Error("User must be logged in");
      }

      const existing = await UserResponseRepository.findResponse(
        employeeId,
        surveyId
      );

      if (existing) {
        throw new Error("You already submitted this survey");
      }
    }

    // 🔥 ANONYMOUS
    if (surveyType === "ANONYMOUS") {

      if (!anonymousToken) {
        throw new Error("Anonymous token missing");
      }

      const existing = await UserResponseRepository.findAnonymousResponse(
        anonymousToken,
        surveyId
      );

      if (existing) {
        throw new Error("You already submitted this survey");
      }
    }

    return sequelize.transaction(async (t: Transaction) => {

      const response = await UserResponseRepository.createResponse(
        {
          surveyId,
          employeeId: surveyType === "ATTRIBUTED" ? employeeId : null,
          anonymousToken: surveyType === "ANONYMOUS" ? anonymousToken : null
        },
        t
      );

      const formattedAnswers: CreateAnswerDTO[] = answers.map((a) => ({
        responseId: response.id,
        questionId: a.questionId,
        optionId: a.optionId,
        answer: a.text,   // ✅ FIXED (matches your Answer model)
        rating: a.rating
      }));

      await UserResponseRepository.bulkCreateAnswers(formattedAnswers, t);

      return response;
    });
  }
}