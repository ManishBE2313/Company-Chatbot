"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface JobCriteriaAttributes {
  id: string;
  organizationId: string;
  jobId: string;
  requirements: Record<string, unknown>;
  isActive?: boolean;
}

export interface JobCriteriaInstance extends Model<JobCriteriaAttributes>, JobCriteriaAttributes {}

export default function JobCriteriaModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<JobCriteriaInstance> & {
  associate?: (models: any) => void;
} {
  const JobCriteria = sequelize.define<JobCriteriaInstance>(
    "jobCriteria",
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
      jobId: {
        type: DataTypes.UUID,
        field: "job_id",
        allowNull: false,
        unique: true,
        references: {
          model: "jobs",
          key: "id",
        },
      },
      requirements: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        field: "is_active",
        defaultValue: true,
      },
    },
    {
      tableName: "job_criteria",
      modelName: "jobCriteria",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<JobCriteriaInstance> & {
    associate?: (models: any) => void;
  };

  JobCriteria.associate = (models: any) => {
    JobCriteria.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    JobCriteria.belongsTo(models.job, {
      foreignKey: "jobId",
      as: "job",
    });
  };

  return JobCriteria;
}
