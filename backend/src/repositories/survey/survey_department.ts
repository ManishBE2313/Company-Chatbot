import SurveyDepartmentModel from "../../../models/survey/survey_department";
import { sequelize } from "../../config/database";
import { Transaction } from "sequelize";

const SurveyDepartment = SurveyDepartmentModel(sequelize);

export class SurveyDepartmentRepository {
  static async bulkCreate(data: any[], transaction: Transaction) {
    return SurveyDepartment.bulkCreate(data, { transaction });
  }

  static async deleteBySurveyId(surveyId: string, transaction: Transaction) {
    return SurveyDepartment.destroy({
      where: { surveyId },
      transaction,
    });
  }
}