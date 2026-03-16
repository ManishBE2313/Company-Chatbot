"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface CandidateAttributes {
  id: string;
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  resumeUrl: string;
  status?: "Pending" | "Passed" | "Rejected";
  aiScore?: number | null;
  aiTags?: unknown[] | Record<string, unknown> | null;
  aiReasoning?: string | null;
}

export interface CandidateInstance
  extends Model<CandidateAttributes>,
    CandidateAttributes {}

export default function CandidateModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<CandidateInstance> & {
  associate?: (models: any) => void;
} {
  const Candidate = sequelize.define<CandidateInstance>(
    "candidate",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      jobId: {
        type: DataTypes.UUID,
        field: "job_id",
        allowNull: false,
        references: {
          model: "job_criteria",
          key: "id",
        },
      },
      firstName: {
        type: DataTypes.STRING,
        field: "first_name",
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        field: "last_name",
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resumeUrl: {
        type: DataTypes.STRING,
        field: "resume_url",
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Pending", "Passed", "Rejected"),
        defaultValue: "Pending",
      },
      aiScore: {
        type: DataTypes.INTEGER,
        field: "ai_score",
        allowNull: true,
      },
      aiTags: {
        type: DataTypes.JSONB,
        field: "ai_tags",
        allowNull: true,
      },
      aiReasoning: {
        type: DataTypes.TEXT,
        field: "ai_reasoning",
        allowNull: true,
      },
    },
    {
      tableName: "candidates",
      modelName: "candidate",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<CandidateInstance> & {
    associate?: (models: any) => void;
  };

  Candidate.associate = (models: any) => {
    Candidate.belongsTo(models.jobCriteria, {
      foreignKey: "jobId",
      as: "job",
    });
  };

  return Candidate;
}
