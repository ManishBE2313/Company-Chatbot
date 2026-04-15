import { Transaction } from "sequelize";
import { sequelize } from "../../config/database";

import { UserResponseRepository } from "../../repositories/survey/user_response";
import { EmployeeRepository } from "../../repositories/survey/employee";

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

  static async getUserSurveys(
    employeeId: UUID | null,
    anonymousToken: string | null
  ) {

    const surveys = await UserResponseRepository.getAllSurveys();

    let filteredSurveys = surveys;

    //  Department filtering
    if (employeeId) {
      const employee = await EmployeeRepository.findById(employeeId);

      filteredSurveys = surveys.filter((s: any) => {
        if (s.isForAllDepartments) return true;

        const surveyDepartments = s.departments.map((d: any) =>
          d.name.toLowerCase()
        );

        return surveyDepartments.includes(employee.departmentId);
      });
    }

    const responses = await UserResponseRepository.getUserResponses(
      employeeId,
      anonymousToken
    );

    const submittedSurveyIds = new Set(
      responses.map((r: any) => r.surveyId)
    );

    const now = new Date();

    return filteredSurveys.map((s: any) => {

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

  static async getSurvey(
    employeeId: UUID | null,
    surveyId: UUID,
    anonymousToken: string | null
  ) {

    const survey = await UserResponseRepository.getSurveyById(surveyId);

    if (!survey) {
      throw new Error("Survey not found");
    }

    // Department check
    if (employeeId && survey.surveyType !== "ANONYMOUS") {
      const employee = await EmployeeRepository.findById(employeeId);

      if (!survey.isForAllDepartments) {
        const surveyDepartments = survey.departments.map((d: any) =>
          d.name.toLowerCase()
        );

        if (!surveyDepartments.includes(employee.departmentId)) {
          throw new Error("You are not allowed to view this survey");
        }
      }
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

    //  Department check (only for attributed)
    if (employeeId && surveyType !== "ANONYMOUS") {

      const employee = await EmployeeRepository.findById(employeeId);

      if (!survey.isForAllDepartments) {
        const surveyDepartments = survey.departments.map((d: any) =>
          d.name.toLowerCase()
        );

        const employeeDepartment = employee.departmentId;

        if (!employeeDepartment || !surveyDepartments.includes(employeeDepartment)) {
          throw new Error("You are not allowed to take this survey");
        }
      }
    }

    //Validate questions
    const surveyQuestionIds = survey.questions.map((q: any) => q.id);
    const answerQuestionIds = answers.map((a) => a.questionId);

    // No extra questions
    const invalidIds = answerQuestionIds.filter(
      (id) => !surveyQuestionIds.includes(id)
    );

    if (invalidIds.length > 0) {
      throw new Error("Invalid questionId in answers");
    }

    // All questions must be answered
    if (surveyQuestionIds.length !== answerQuestionIds.length) {
      throw new Error("All questions must be answered");
    }

    // ATTRIBUTED
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

    //  ANONYMOUS
    if (surveyType === "ANONYMOUS") {

      if (!anonymousToken) {
        throw new Error("Anonymous token missing");
      }
      
  if (survey.endAt && new Date(survey.endAt) < new Date()) {
  throw new Error("Survey has expired");
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
        text: a.text, 
        rating: a.rating
      }));

      await UserResponseRepository.bulkCreateAnswers(formattedAnswers, t);

      return response;
    });
  }
}
