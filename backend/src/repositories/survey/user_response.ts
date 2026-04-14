import { Transaction } from "sequelize";
import { sequelize, Survey, SurveyQuestion, SurveyOption, SurveyResponse, SurveyAnswer } from "../../config/database";

type CreateResponseDTO = {
  surveyId: string;
  employeeId: string | null;
  anonymousToken?: string | null;
};

type CreateAnswerDTO = {
  responseId: string;
  questionId: string;
  optionId?: string;
  answer?: string;
  rating?: number;
};

export class UserResponseRepository {
  static async getAllSurveys() {
    return Survey.findAll();
  }

  static async getSurveyById(surveyId: string) {
    return Survey.findOne({
      where: { id: surveyId },
      include: [
        {
          model: SurveyQuestion,
          as: "questions",
          include: [
            {
              model: SurveyOption,
              as: "options"
            }
          ]
        }
      ]
    });
  }

  static async findResponse(employeeId: string, surveyId: string) {
    return SurveyResponse.findOne({
      where: {
        employeeId,
        surveyId
      }
    });
  }

  static async findAnonymousResponse(
    anonymousToken: string,
    surveyId: string
  ) {
    return SurveyResponse.findOne({
      where: {
        anonymousToken,
        surveyId
      }
    });
  }

  static async getUserResponses(
    employeeId: string | null,
    anonymousToken: string | null
  ) {
    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    } else if (anonymousToken) {
      where.anonymousToken = anonymousToken;
    }

    return SurveyResponse.findAll({
      where,
      attributes: ["surveyId"]
    });
  }

  static async createResponse(
    data: CreateResponseDTO,
    transaction: Transaction
  ) {
    return SurveyResponse.create(data, { transaction });
  }

  static async bulkCreateAnswers(
    data: CreateAnswerDTO[],
    transaction: Transaction
  ) {
    return SurveyAnswer.bulkCreate(data, { transaction });
  }
}
