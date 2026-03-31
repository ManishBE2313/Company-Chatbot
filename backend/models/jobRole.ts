"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface JobRoleAttributes {
  id: string;
  organizationId: string;
  title: string;
  jobFamily?: string | null;
  level?: string | null;
  defaultExperienceMin?: number | null;
  defaultExperienceMax?: number | null;
  description?: string | null;
  isActive?: boolean;
}

export interface JobRoleInstance extends Model<JobRoleAttributes>, JobRoleAttributes {}

export default function JobRoleModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<JobRoleInstance> & {
  associate?: (models: any) => void;
} {
  const JobRole = sequelize.define<JobRoleInstance>(
    "jobRole",
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
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      jobFamily: {
        type: DataTypes.STRING,
        field: "job_family",
        allowNull: true,
      },
      level: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      defaultExperienceMin: {
        type: DataTypes.INTEGER,
        field: "default_experience_min",
        allowNull: true,
      },
      defaultExperienceMax: {
        type: DataTypes.INTEGER,
        field: "default_experience_max",
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        field: "is_active",
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "job_roles",
      modelName: "jobRole",
      schema,
      timestamps: true,
      indexes: [{ unique: true, fields: ["organization_id", "title", "level"] }],
    }
  ) as ModelStatic<JobRoleInstance> & {
    associate?: (models: any) => void;
  };

  JobRole.associate = (models: any) => {
    JobRole.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    JobRole.hasMany(models.jobRoleSkill, { foreignKey: "jobRoleId", as: "roleSkills" });
    JobRole.hasMany(models.job, { foreignKey: "jobRoleId", as: "jobs" });
  };

  return JobRole;
}
