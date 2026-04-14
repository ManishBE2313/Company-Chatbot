"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface AnonymousAggregationCacheAttributes {
  id: string;
  surveyId: string;
  questionId: string;
  responseCount: number;
  avgScore?: number | null;
  textResponses?: object | null;
}

export interface AnonymousAggregationCacheInstance
  extends Model<AnonymousAggregationCacheAttributes>,
    AnonymousAggregationCacheAttributes {}

export default function AnonymousAggregationCacheModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<AnonymousAggregationCacheInstance> & {
  associate?: (models: any) => void;
} {
  const Cache = sequelize.define<AnonymousAggregationCacheInstance>(
    "anonymousAggregationCache",
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
      questionId: {
        type: DataTypes.UUID,
        field: "question_id",
        allowNull: false,
      },
      responseCount: {
        type: DataTypes.INTEGER,
        field: "response_count",
        allowNull: false,
      },
      avgScore: {
        type: DataTypes.FLOAT,
        field: "avg_score",
      },
      textResponses: {
        type: DataTypes.JSONB,
        field: "text_responses",
      },
    },
    {
      tableName: "anonymous_aggregation_cache",
      modelName: "anonymousAggregationCache",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<AnonymousAggregationCacheInstance> & {
    associate?: (models: any) => void;
  };

  Cache.associate = (models: any) => {
    Cache.belongsTo(models.survey, { foreignKey: "surveyId", as: "survey" });
    Cache.belongsTo(models.question, { foreignKey: "questionId", as: "question" });
  };

  return Cache;
}