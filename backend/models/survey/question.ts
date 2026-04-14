"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface QuestionAttributes {
  id: string;
  surveyId: string;
  questionText: string;
  type: "rating" | "text" | "mcq";
}

export interface QuestionInstance
  extends Model<QuestionAttributes>,
    QuestionAttributes {}

export default function QuestionModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<QuestionInstance> & { associate?: (models: any) => void } {
  const Question = sequelize.define<QuestionInstance>(
    "question",
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
        references: {
          model: "surveys",
          key: "id",
        },
      },
      questionText: {
        type: DataTypes.TEXT,
        field: "question_text",
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("rating", "text", "mcq"),
        allowNull: false,
      },
    },
    {
      tableName: "questions",
      modelName: "question",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<QuestionInstance> & { associate?: (models: any) => void };

  Question.associate = (models: any) => {
    Question.belongsTo(models.survey, {
      foreignKey: "surveyId",
      as: "survey",
    });

    Question.hasMany(models.answer, {
      foreignKey: "questionId",
      as: "answers",
    });


    Question.hasMany(models.option, {
      foreignKey: "questionId",
      as: "options",
      onDelete: "CASCADE", 
    });
  };

  return Question;
}