import { Op, Transaction } from "sequelize";
import { sequelize, Department, Survey, SurveyQuestion, SurveyOption, SurveyResponse, SurveyAnswer } from "../../config/database";

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
    return Survey.findAll({
      include: [
        {
          model: Department,
          as: "departments",
          through: { attributes: [] },
        },
      ],
    });
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
              as: "options",
            },
          ],
        },
        {
          model: Department,
          as: "departments",
          through: { attributes: [] },
        },
      ],
    });
  }

  static async findResponse(employeeId: string, surveyId: string) {
    return SurveyResponse.findOne({
      where: {
        employeeId,
        surveyId,
      },
    });
  }

  static async findAnonymousResponse(anonymousToken: string, surveyId: string) {
    return SurveyResponse.findOne({
      where: {
        anonymousToken,
        surveyId,
      },
    });
  }

  static async getUserResponses(employeeId: string | null, anonymousToken: string | null) {
    const filters: Record<string, unknown>[] = [];

    if (employeeId) {
      filters.push({ employeeId });
    }

    if (anonymousToken) {
      filters.push({ anonymousToken });
    }

    return SurveyResponse.findAll({
      where: filters.length > 0 ? { [Op.or]: filters } : undefined,
      attributes: ["surveyId"],
    });
  }

  static async createResponse(data: CreateResponseDTO, transaction: Transaction) {
    return SurveyResponse.create(data, { transaction });
  }

  static async bulkCreateAnswers(data: CreateAnswerDTO[], transaction: Transaction) {
    return SurveyAnswer.bulkCreate(data, { transaction });
  }
}
