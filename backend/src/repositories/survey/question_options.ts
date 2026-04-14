import { sequelize } from "../../config/database";
import OptionModel from "../../../models/survey/question_options";
import { Transaction } from "sequelize";

const optionModel = OptionModel(sequelize);

interface CreateOptionDTO {
  questionId: string;
  text: string;
}

export class OptionRepository {
  //CREATE single option
  static async createOption(
    data: CreateOptionDTO,
    transaction: Transaction
  ) {
    return optionModel.create(data, { transaction });
  }

  // UPDATE single option
  static async updateOption(
    id: string,
    data: Partial<CreateOptionDTO>,
    transaction: Transaction
  ) {
    await optionModel.update(data, {
      where: { id },
      transaction,
    });

    return optionModel.findOne({ where: { id } });
  }

  // (Keep existing for bulk flows if needed)
  static async bulkCreate(
    data: CreateOptionDTO[],
    transaction: Transaction
  ) {
    return optionModel.bulkCreate(data, { transaction });
  }
}