import { sequelize } from "../../config/database";
import QuestionModel from "../../../models/survey/question";
import { Transaction } from "sequelize";

const questionModel = QuestionModel(sequelize);

interface CreateQuestionDTO {
  surveyId: string;
  questionText: string;
  type: "rating" | "text" | "mcq";

}

export class QuestionRepository {
  //  CREATE single question
  static async create(
    data: CreateQuestionDTO,
    transaction: Transaction
  ) {
    return questionModel.create(data, { transaction });
  }

  // UPDATE single question
  static async updateQuestion(
    id: string,
    data: Partial<CreateQuestionDTO>,
    transaction: Transaction
  ) {
    await questionModel.update(data, {
      where: { id },
      transaction,
    });

    return questionModel.findOne({ where: { id } });
  }

  static async bulkCreate(
    data: CreateQuestionDTO[],
    transaction: Transaction
  ) {
    return questionModel.bulkCreate(data, {transaction,returning: true,});
  }

  static async deleteBySurveyId(
    surveyId: string,
    transaction: Transaction
  ) {
    await questionModel.destroy({
      where: { surveyId },
      transaction,
    });
  }
}