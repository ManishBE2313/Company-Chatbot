"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface JobRoleSkillAttributes {
  id: string;
  organizationId: string;
  jobRoleId: string;
  skillId: string;
  weight?: number | null;
  isMandatory?: boolean;
}

export interface JobRoleSkillInstance extends Model<JobRoleSkillAttributes>, JobRoleSkillAttributes {}

export default function JobRoleSkillModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<JobRoleSkillInstance> & {
  associate?: (models: any) => void;
} {
  const JobRoleSkill = sequelize.define<JobRoleSkillInstance>(
    "jobRoleSkill",
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
      jobRoleId: {
        type: DataTypes.UUID,
        field: "job_role_id",
        allowNull: false,
        references: {
          model: "job_roles",
          key: "id",
        },
      },
      skillId: {
        type: DataTypes.UUID,
        field: "skill_id",
        allowNull: false,
        references: {
          model: "skills",
          key: "id",
        },
      },
      weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      isMandatory: {
        type: DataTypes.BOOLEAN,
        field: "is_mandatory",
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "job_role_skills",
      modelName: "jobRoleSkill",
      schema,
      timestamps: true,
      indexes: [{ unique: true, fields: ["organization_id", "job_role_id", "skill_id"] }],
    }
  ) as ModelStatic<JobRoleSkillInstance> & {
    associate?: (models: any) => void;
  };

  JobRoleSkill.associate = (models: any) => {
    JobRoleSkill.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    JobRoleSkill.belongsTo(models.jobRole, { foreignKey: "jobRoleId", as: "jobRole" });
    JobRoleSkill.belongsTo(models.skill, { foreignKey: "skillId", as: "skill" });
  };

  return JobRoleSkill;
}
