"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface JobDescriptionTemplateAttributes {
  id: string;
  organizationId: string;
  title: string;
  jobRoleId?: string | null;
  description: string;
  refinedDescription?: string | null;
  mustHaveSkillIds?: string[] | null;
  niceToHaveSkillIds?: string[] | null;
  isActive?: boolean;
}

export interface JobDescriptionTemplateInstance extends Model<JobDescriptionTemplateAttributes>, JobDescriptionTemplateAttributes {}

export default function JobDescriptionTemplateModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<JobDescriptionTemplateInstance> & {
  associate?: (models: any) => void;
} {
  const JobDescriptionTemplate = sequelize.define<JobDescriptionTemplateInstance>(
    "jobDescriptionTemplate",
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
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      jobRoleId: {
        type: DataTypes.UUID,
        field: "job_role_id",
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      refinedDescription: {
        type: DataTypes.TEXT,
        field: "refined_description",
        allowNull: true,
      },
      mustHaveSkillIds: {
        type: DataTypes.JSON,
        field: "must_have_skill_ids",
        allowNull: true,
      },
      niceToHaveSkillIds: {
        type: DataTypes.JSON,
        field: "nice_to_have_skill_ids",
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
      tableName: "job_description_templates",
      modelName: "jobDescriptionTemplate",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<JobDescriptionTemplateInstance> & {
    associate?: (models: any) => void;
  };

  JobDescriptionTemplate.associate = (models: any) => {
    JobDescriptionTemplate.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    JobDescriptionTemplate.belongsTo(models.jobRole, { foreignKey: "jobRoleId", as: "jobRole" });
  };

  return JobDescriptionTemplate;
}
