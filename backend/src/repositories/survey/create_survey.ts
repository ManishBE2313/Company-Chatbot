import { sequelize } from "../../config/database";
import SurveyModel from "../../../models/survey/survey";
import { Transaction, Op } from "sequelize";
import QuestionModel from "../../../models/survey/question";
import OptionModel from "../../../models/survey/question_options";
import DepartmentModel from "../../../models/survey/department"; // ✅ NEW
import SurveyDepartmentModel from "../../../models/survey/survey_department"; // ✅ NEW

const surveyModel = SurveyModel(sequelize);
const questionModel = QuestionModel(sequelize);
const optionModel = OptionModel(sequelize);
const departmentModel = DepartmentModel(sequelize);
const surveyDepartmentModel = SurveyDepartmentModel(sequelize);

interface CreateSurveyDTO {
  title: string;
  surveyType: "ATTRIBUTED" | "ANONYMOUS";
  startAt: Date;
  endAt: Date;
  isForAllDepartments?: boolean;
}

export class SurveyRepository {
  // CREATE
  static async createSurvey(
    data: CreateSurveyDTO,
    transaction: Transaction
  ) {
    return surveyModel.create(data, { transaction });
  }

  // FIND BY ID
  static async findById(id: string) {
    return surveyModel.findOne({
      where: { id },
      include: [
        {
          model: questionModel,
          as: "questions",
          include: [
            {
              model: optionModel,
              as: "options",
            },
          ],
        },
        {
          model: departmentModel,
          as: "departments",
          through: { attributes: [] }, // hide join table
        },
      ],
    });
  }

  // GET ALL (status + pagination + sorting)
  static async getAllSurveys(params: {
    status?: string;
    page: number;
    limit: number;
    sortBy: string;
    order: "ASC" | "DESC";
    departmentIds?: string[];
  }) {
    const { status, page, limit, sortBy, order, departmentIds } = params;

    const offset = (page - 1) * limit;
    const now = new Date();

    let where: any = {};

    if (status === "UPCOMING") {
      where.startAt = { [Op.gt]: now };
    }

    if (status === "ACTIVE") {
      where.startAt = { [Op.lte]: now };
      where.endAt = { [Op.gte]: now };
    }

    if (status === "EXPIRED") {
      where.endAt = { [Op.lt]: now };
    }

    let include: any[] = [
      {
        model: questionModel,
        as: "questions",
        attributes: ["id"],
      },
    ];

   if (departmentIds && departmentIds.length > 0) {
  include.push({
    model: departmentModel,
    as: "departments",
    required: false,
    attributes: ["id", "name"],
    where: {
      id: {
        [Op.in]: departmentIds,
      },
    },
    through: { attributes: [] },
  });

  where[Op.or] = [
    { isForAllDepartments: true },
    {
      "$departments.id$": {
        [Op.in]: departmentIds,
      },
    },
  ];
}

    return surveyModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, order]],
      include,
      distinct: true,
    });
  }

  // UPDATE
  static async updateSurvey(
    id: string,
    data: any,
    transaction: Transaction
  ) {
    await surveyModel.update(data, {
      where: { id },
      transaction,
    });
  }
}