"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface SurveyAttributes {
  id: string;
  title: string;
  surveyType: "ATTRIBUTED" | "ANONYMOUS";
  startAt?: Date | null;
  endAt?: Date | null;
  isForAllDepartments: boolean;
}

export interface SurveyInstance
  extends Model<SurveyAttributes>,
    SurveyAttributes {}

export default function SurveyModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<SurveyInstance> & { associate?: (models: any) => void } {
  const Survey = sequelize.define<SurveyInstance>(
    "survey",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      surveyType: {
        type: DataTypes.ENUM("ATTRIBUTED", "ANONYMOUS"),
        field: "survey_type",
        allowNull: false,
        defaultValue: "ATTRIBUTED",
      },
      startAt: {
        type: DataTypes.DATE,
        field: "start_at",
        allowNull: true,
      },
      endAt: {
        type: DataTypes.DATE,
        field: "end_at",
        allowNull: true,
      },
      isForAllDepartments: {
        type: DataTypes.BOOLEAN,
        field: "is_for_all_departments",
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "surveys",
      modelName: "survey",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<SurveyInstance> & { associate?: (models: any) => void };

  Survey.associate = (models: any) => {
    Survey.hasMany(models.question, {
      foreignKey: "surveyId",
      as: "questions",
      onDelete: "CASCADE",
    });

    Survey.hasMany(models.response, {
      foreignKey: "surveyId",
      as: "responses",
    });

    Survey.belongsToMany(models.department, {
      through: models.survey_department,
      foreignKey: "surveyId",
      otherKey: "departmentId",
      as: "departments",
    });
  };

  return Survey;
}