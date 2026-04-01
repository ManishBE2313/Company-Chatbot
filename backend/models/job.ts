"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface JobAttributes {
  id: string;
  organizationId: string;
  departmentId?: string | null;
  locationId?: string | null;
  jobRoleId?: string | null;
  panelId?: string | null;
  createdById?: string | null;
  title: string;
  department: string;
  location: string;
  status: "Draft" | "Open" | "Paused" | "Closed";
  headcount: number;
  pipelineConfig?: any[] | null;
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN" | null;
  workModel?: "ON_SITE" | "REMOTE" | "HYBRID" | null;
  seniorityLevel?: string | null;
  experienceMin?: number | null;
  experienceMax?: number | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  payFrequency?: "HOURLY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  salaryVisibility?: "PUBLIC" | "INTERNAL" | "HIDDEN" | null;
  aiMatchPercentage?: number | null;
  reviewStatus?: "approved" | "needs_review" | "blocked";
}

export interface JobInstance extends Model<JobAttributes>, JobAttributes {}

export default function JobModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<JobInstance> & {
  associate?: (models: any) => void;
} {
  const Job = sequelize.define<JobInstance>(
    "job",
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
      departmentId: {
        type: DataTypes.UUID,
        field: "department_id",
        allowNull: true,
        references: {
          model: "departments",
          key: "id",
        },
      },
      locationId: {
        type: DataTypes.UUID,
        field: "location_id",
        allowNull: true,
        references: {
          model: "locations",
          key: "id",
        },
      },
      jobRoleId: {
        type: DataTypes.UUID,
        field: "job_role_id",
        allowNull: true,
        references: {
          model: "job_roles",
          key: "id",
        },
      },
      panelId: {
        type: DataTypes.UUID,
        field: "panel_id",
        allowNull: true,
        references: {
          model: "interview_panels",
          key: "id",
        },
      },
      createdById: {
        type: DataTypes.UUID,
        field: "created_by_id",
        allowNull: true,
        references: {
          model: "employees",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      department: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Draft", "Open", "Paused", "Closed"),
        defaultValue: "Draft",
      },
      headcount: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
      },
      pipelineConfig: {
        type: DataTypes.JSON,
        field: "pipeline_config",
        allowNull: true,
      },
      employmentType: {
        type: DataTypes.ENUM("FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"),
        field: "employment_type",
        allowNull: true,
      },
      workModel: {
        type: DataTypes.ENUM("ON_SITE", "REMOTE", "HYBRID"),
        field: "work_model",
        allowNull: true,
      },
      seniorityLevel: {
        type: DataTypes.STRING,
        field: "seniority_level",
        allowNull: true,
      },
      experienceMin: {
        type: DataTypes.INTEGER,
        field: "experience_min",
        allowNull: true,
      },
      experienceMax: {
        type: DataTypes.INTEGER,
        field: "experience_max",
        allowNull: true,
      },
      salaryMin: {
        type: DataTypes.FLOAT,
        field: "salary_min",
        allowNull: true,
      },
      salaryMax: {
        type: DataTypes.FLOAT,
        field: "salary_max",
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "USD",
      },
      payFrequency: {
        type: DataTypes.ENUM("HOURLY", "WEEKLY", "MONTHLY", "YEARLY"),
        field: "pay_frequency",
        allowNull: true,
        defaultValue: "YEARLY",
      },
      salaryVisibility: {
        type: DataTypes.ENUM("PUBLIC", "INTERNAL", "HIDDEN"),
        field: "salary_visibility",
        allowNull: true,
        defaultValue: "PUBLIC",
      },
      aiMatchPercentage: {
        type: DataTypes.FLOAT,
        field: "ai_match_percentage",
        allowNull: true,
      },
      reviewStatus: {
        type: DataTypes.ENUM("approved", "needs_review", "blocked"),
        field: "review_status",
        allowNull: false,
        defaultValue: "approved",
      },
    },
    {
      tableName: "jobs",
      modelName: "job",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<JobInstance> & {
    associate?: (models: any) => void;
  };

  Job.associate = (models: any) => {
    Job.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    Job.belongsTo(models.department, { foreignKey: "departmentId", as: "departmentRef" });
    Job.belongsTo(models.location, { foreignKey: "locationId", as: "locationRef" });
    Job.belongsTo(models.jobRole, { foreignKey: "jobRoleId", as: "jobRole" });
    Job.belongsTo(models.interviewPanel, { foreignKey: "panelId", as: "panel" });
    Job.belongsTo(models.user, { foreignKey: "createdById", as: "createdBy" });
    Job.hasOne(models.jobCriteria, {
      foreignKey: "jobId",
      as: "criteria",
    });

    Job.hasMany(models.jobApplication, {
      foreignKey: "jobId",
      as: "applications",
    });
  };

  return Job;
}
