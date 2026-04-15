import { Transaction, Op } from "sequelize";
import {
  sequelize,
  Survey,
  SurveyQuestion,
  SurveyOption,
  Department,
} from "../../config/database";
 
interface CreateSurveyDTO {
  title: string;
  surveyType: "ATTRIBUTED" | "ANONYMOUS";
  startAt: Date;
  endAt: Date;
  isForAllDepartments?: boolean;
}
 
export class SurveyRepository {
  static async createSurvey(
    data: CreateSurveyDTO,
    transaction: Transaction
  ) {
    return Survey.create(data, { transaction });
  }
 
  static async findById(id: string) {
    return Survey.findOne({
      where: { id },
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
 
    const where: any = {};
 
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
 
    const include: any[] = [
      {
        model: SurveyQuestion,
        as: "questions",
        attributes: ["id"],
      },
    ];
 
    if (departmentIds && departmentIds.length > 0) {
      include.push({
        model: Department,
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
 
    return Survey.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, order]],
      include,
      distinct: true,
    });
  }
 
  static async updateSurvey(
    id: string,
    data: any,
    transaction: Transaction
  ) {
    await Survey.update(data, {
      where: { id },
      transaction,
    });
  }
}