"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface SurveyDepartmentRefAttributes {
  id: string;
  name: string;
}

export interface SurveyDepartmentRefInstance
  extends Model<SurveyDepartmentRefAttributes>,
    SurveyDepartmentRefAttributes {}

export default function SurveyDepartmentRefModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<SurveyDepartmentRefInstance> & { associate?: (models: any) => void } {
  const SurveyDepartmentRef = sequelize.define<SurveyDepartmentRefInstance>(
    "surveyDepartment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "departments",
      modelName: "surveyDepartment",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<SurveyDepartmentRefInstance> & {
    associate?: (models: any) => void;
  };

  SurveyDepartmentRef.associate = (models: any) => {
    SurveyDepartmentRef.belongsToMany(models.survey, {
      through: models.survey_department,
      foreignKey: "departmentId",
      otherKey: "surveyId",
      as: "surveys",
    });
  };

  return SurveyDepartmentRef;
}
