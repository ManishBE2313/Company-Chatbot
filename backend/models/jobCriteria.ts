"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface JobCriteriaAttributes {
  id: string;
  title: string;
  department?: string;
  requirements: Record<string, unknown>;
  isActive?: boolean;
}

export interface JobCriteriaInstance
  extends Model<JobCriteriaAttributes>,
    JobCriteriaAttributes {}

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
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      requirements: {
        type: DataTypes.JSONB,
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
    JobCriteria.hasMany(models.candidate, {
      foreignKey: "jobId",
      as: "candidates",
    });
  };

  return JobCriteria;
}
