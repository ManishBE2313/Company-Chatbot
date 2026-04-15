"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface OptionAttributes {
  id: string;
  questionId: string;
  text: string;
}

export interface OptionInstance
  extends Model<OptionAttributes>,
    OptionAttributes {}

export default function OptionModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<OptionInstance> & { associate?: (models: any) => void } {
  const Option = sequelize.define<OptionInstance>(
    "option",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      questionId: {
        type: DataTypes.UUID,
        field: "question_id",
        allowNull: false,
        references: {
          model: "questions",
          key: "id",
        },
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "options",
      modelName: "option",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<OptionInstance> & { associate?: (models: any) => void };

  Option.associate = (models: any) => {
    Option.belongsTo(models.question, {
      foreignKey: "questionId",
      as: "question",
    });
  };

  return Option;
}