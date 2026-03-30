"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export type ApplicationStatus =
  | "PENDING"
  | "SCREENED"
  | "SCHEDULING"
  | "SCHEDULED"
  | "EVALUATING"
  | "OFFERED"
  | "REJECTED"
  | "WITHDRAWN";

export interface JobApplicationAttributes {
  id: string;
  candidateId: string;
  jobId: string;
  resumeUrl: string;
  status: ApplicationStatus;
  currentStage?: string | null;
  priorityScore?: number | null;
  rescheduleCount?: number;
  aiScore?: number | null;
  aiTags?: Record<string, unknown> | unknown[] | null;
  aiReasoning?: string | null;
}

export interface JobApplicationInstance extends Model<JobApplicationAttributes>, JobApplicationAttributes {}

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
        type: DataTypes.ENUM(
          "PENDING",
          "SCREENED",
          "SCHEDULING",
          "SCHEDULED",
          "EVALUATING",
          "OFFERED",
          "REJECTED",
          "WITHDRAWN"
        ),
        defaultValue: "PENDING",
      },
      currentStage: {
        type: DataTypes.STRING,
        field: "current_stage",
        allowNull: true,
      },
      priorityScore: {
        type: DataTypes.FLOAT,
        field: "priority_score",
        allowNull: true,
      },
      rescheduleCount: {
        type: DataTypes.INTEGER,
        field: "reschedule_count",
        defaultValue: 0,
      },
      aiScore: {
        type: DataTypes.INTEGER,
        field: "ai_score",
        allowNull: true,
      },
      aiTags: {
        type: DataTypes.JSON,
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

    JobApplication.hasMany(models.interview, {
      foreignKey: "applicationId",
      as: "interviews",
    });

    JobApplication.hasMany(models.pipelineEvent, {
      foreignKey: "applicationId",
      as: "events",
    });
  };

  return JobApplication;
}