"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface AnswerAttributes {
  id: string;
  responseId: string;
  questionId: string;
  answer?: string | null;
  optionId?: string | null;
  rating?: number | null;
}

export interface AnswerInstance
  extends Model<AnswerAttributes>,
    AnswerAttributes {}

export default function AnswerModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<AnswerInstance> & { associate?: (models: any) => void } {

  const Answer = sequelize.define<AnswerInstance>(
    "answer",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      responseId: {
        type: DataTypes.UUID,
        field: "response_id",
        allowNull: false,
      },
      questionId: {
        type: DataTypes.UUID,
        field: "question_id",
        allowNull: false,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      optionId: {
        type: DataTypes.UUID,
        field: "option_id",
        allowNull: true,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "answers",
      modelName: "answer",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<AnswerInstance> & { associate?: (models: any) => void };

  Answer.associate = (models: any) => {
    Answer.belongsTo(models.response, {
      foreignKey: "responseId",
      as: "response",
    });

    Answer.belongsTo(models.question, {
      foreignKey: "questionId",
      as: "question",
    });

    Answer.belongsTo(models.option, {
      foreignKey: "optionId",
      as: "option",
    });
  };

  return Answer;
}