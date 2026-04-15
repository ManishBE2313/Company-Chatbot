"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface ScorecardAttributes {
  id: string;
  organizationId: string;
  interviewId: string;
  interviewerId: string;
  technicalScore: number;
  communicationScore: number;
  notes?: string | null;
  recommendation: "STRONG_HIRE" | "HIRE" | "HOLD" | "NO_HIRE";
}

export interface ScorecardInstance extends Model<ScorecardAttributes>, ScorecardAttributes {}

export default function ScorecardModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<ScorecardInstance> & {
  associate?: (models: any) => void;
} {
  const Scorecard = sequelize.define<ScorecardInstance>(
    "scorecard",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      organizationId: {
        type: DataTypes.UUID,
        field: "organization_id",
        allowNull: false,
        defaultValue: DEFAULT_ORGANIZATION_ID,
        references: {
          model: "organizations",
          key: "id",
        },
      },
      interviewId: {
        type: DataTypes.UUID,
        field: "interview_id",
        allowNull: false,
        unique: true,
        references: {
          model: "interviews",
          key: "id",
        },
      },
      interviewerId: {
        type: DataTypes.UUID,
        field: "interviewer_id",
        allowNull: false,
        references: {
          model: "employees",
          key: "id",
        },
      },
      technicalScore: {
        type: DataTypes.INTEGER,
        field: "technical_score",
        allowNull: false,
      },
      communicationScore: {
        type: DataTypes.INTEGER,
        field: "communication_score",
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      recommendation: {
        type: DataTypes.ENUM("STRONG_HIRE", "HIRE", "HOLD", "NO_HIRE"),
        allowNull: false,
      },
    },
    {
      tableName: "scorecards",
      modelName: "scorecard",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<ScorecardInstance> & {
    associate?: (models: any) => void;
  };

  Scorecard.associate = (models: any) => {
    Scorecard.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    Scorecard.belongsTo(models.interview, {
      foreignKey: "interviewId",
      as: "interview",
    });
    Scorecard.belongsTo(models.user, {
      foreignKey: "interviewerId",
      as: "interviewer",
    });
  };

  return Scorecard;
}
