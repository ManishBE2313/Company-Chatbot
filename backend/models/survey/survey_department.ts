"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface SurveyDepartmentAttributes {
  id: string;
  surveyId: string;
  departmentId: string;
}

export interface SurveyDepartmentInstance
  extends Model<SurveyDepartmentAttributes>,
    SurveyDepartmentAttributes {}

export default function SurveyDepartmentModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<SurveyDepartmentInstance> {
  return sequelize.define<SurveyDepartmentInstance>(
    "survey_department",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      surveyId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "survey_id",
      },
      departmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "department_id",
      },
    },
    {
      tableName: "survey_departments",
      modelName: "survey_department",
      schema,
      timestamps: true,
    }
  );
}