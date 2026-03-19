"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface JobAttributes {
  id: string;
  title: string;
  department: string;
  location: string;
  status: "Draft" | "Open" | "Paused" | "Closed";
  headcount: number;
  pipelineConfig?: any[] | null;
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
        type: DataTypes.JSONB,
        field: "pipeline_config",
        allowNull: true,
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