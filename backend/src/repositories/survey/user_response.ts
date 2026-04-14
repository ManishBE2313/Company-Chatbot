import { sequelize } from "../../config/database";
import { Transaction } from "sequelize";

import SurveyModel from "../../../models/survey/survey";
import QuestionModel from "../../../models/survey/question";
import OptionModel from "../../../models/survey/question_options";
import ResponseModel from "../../../models/survey/response";
import AnswerModel from "../../../models/survey/answer";

// ✅ Initialize models
const Survey = SurveyModel(sequelize);
const Question = QuestionModel(sequelize);
const Option = OptionModel(sequelize);
const Response = ResponseModel(sequelize);
const Answer = AnswerModel(sequelize);

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

  // ✅ Get all surveys
  static async getAllSurveys() {
    return Survey.findAll();
  }

  // ✅ Get survey with questions + options
  static async getSurveyById(surveyId: string) {
    return Survey.findOne({
      where: { id: surveyId },
      include: [
        {
          model: Question,
          as: "questions",
          include: [
            {
              model: Option,
              as: "options"
            }
          ]
        }
      ]
    });
  }

  // ✅ Find attributed response
  static async findResponse(employeeId: string, surveyId: string) {
    return Response.findOne({
      where: {
        employeeId,
        surveyId
      }
    });
  }

  // Find anonymous response
  static async findAnonymousResponse(
    anonymousToken: string,
    surveyId: string
  ) {
    return Response.findOne({
      where: {
        anonymousToken,
        surveyId
      }
    });
  }

  // ✅ Get all user responses (for dashboard)
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

    return Response.findAll({
      where,
      attributes: ["surveyId"]
    });
  }

  // ✅ Create response
  static async createResponse(
    data: CreateResponseDTO,
    transaction: Transaction
  ) {
    return Response.create(data, { transaction });
  }

  // ✅ Bulk insert answers
  static async bulkCreateAnswers(
    data: CreateAnswerDTO[],
    transaction: Transaction
  ) {
    return Answer.bulkCreate(data, { transaction });
  }
}