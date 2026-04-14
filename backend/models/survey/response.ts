"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface ResponseAttributes {
  id: string;
  surveyId: string;
  employeeId?: string | null;
  anonymousToken?: string | null;
  submittedAt?: Date;
}

export interface ResponseInstance
  extends Model<ResponseAttributes>,
    ResponseAttributes {}

export default function ResponseModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<ResponseInstance> & { associate?: (models: any) => void } {

  const Response = sequelize.define<ResponseInstance>(
    "response",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      surveyId: {
        type: DataTypes.UUID,
        field: "survey_id",
        allowNull: false,
      },

      employeeId: {
        type: DataTypes.UUID,
        field: "employee_id",
        allowNull: true,
      },

  
      anonymousToken: {
        type: DataTypes.STRING,
        field: "anonymous_token",
        allowNull: true,
      },

      submittedAt: {
        type: DataTypes.DATE,
        field: "submitted_at",
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "responses",
      modelName: "response",
      schema,
      timestamps: false,

      //
      indexes: [
        {
          unique: true,
          fields: ["survey_id", "employee_id"]
        },
        {
          unique: true,
          fields: ["survey_id", "anonymous_token"]
        }
      ]
    }
  ) as ModelStatic<ResponseInstance> & {
    associate?: (models: any) => void;
  };

  Response.associate = (models: any) => {
    Response.belongsTo(models.survey, {
      foreignKey: "surveyId",
      as: "survey",
    });

    Response.belongsTo(models.employee, {
      foreignKey: "employeeId",
      as: "employee",
    });

    Response.hasMany(models.answer, {
      foreignKey: "responseId",
      as: "answers",
    });
  };

  return Response;
}