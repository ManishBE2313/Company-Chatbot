"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface JobApplicationAttributes {
  id: string;
  candidateId: string;
  jobId: string;
  resumeUrl: string;
  status: "Pending" | "Passed" | "Rejected" | "Interviewing" | "Offered";
  aiScore?: number | null;
  aiTags?: Record<string, unknown> | unknown[] | null;
  aiReasoning?: string | null;
}

export interface JobApplicationInstance
  extends Model<JobApplicationAttributes>,
    JobApplicationAttributes {}

export default function JobApplicationModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<JobApplicationInstance> & {
  associate?: (models: any) => void;
} {
  const JobApplication = sequelize.define<JobApplicationInstance>(
    "jobApplication",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      candidateId: {
        type: DataTypes.UUID,
        field: "candidate_id",
        allowNull: false,
        references: {
          model: "candidates",
          key: "id",
        },
      },
      jobId: {
        type: DataTypes.UUID,
        field: "job_id",
        allowNull: false,
        references: {
          model: "jobs",
          key: "id",
        },
      },
      resumeUrl: {
        type: DataTypes.STRING,
        field: "resume_url",
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Pending", "Passed", "Rejected", "Interviewing", "Offered"),
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
      tableName: "job_applications",
      modelName: "jobApplication",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<JobApplicationInstance> & {
    associate?: (models: any) => void;
  };

  JobApplication.associate = (models: any) => {
    JobApplication.belongsTo(models.candidate, {
      foreignKey: "candidateId",
      as: "candidate",
    });

    JobApplication.belongsTo(models.job, {
      foreignKey: "jobId",
      as: "job",
    });
  };

  return JobApplication;
}
