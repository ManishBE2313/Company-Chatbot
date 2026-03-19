"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface PipelineEventAttributes {
  id: string;
  applicationId: string;
  triggeredById?: string | null;
  eventType: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  notes?: string | null;
}

export interface PipelineEventInstance extends Model<PipelineEventAttributes>, PipelineEventAttributes {}

export default function PipelineEventModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<PipelineEventInstance> & {
  associate?: (models: any) => void;
} {
  const PipelineEvent = sequelize.define<PipelineEventInstance>(
    "pipelineEvent",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      applicationId: {
        type: DataTypes.UUID,
        field: "application_id",
        allowNull: false,
        references: {
          model: "job_applications",
          key: "id",
        },
      },
      triggeredById: {
        type: DataTypes.UUID,
        field: "triggered_by_id",
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      eventType: {
        type: DataTypes.STRING,
        field: "event_type",
        allowNull: false,
      },
      fromStatus: {
        type: DataTypes.STRING,
        field: "from_status",
        allowNull: true,
      },
      toStatus: {
        type: DataTypes.STRING,
        field: "to_status",
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "pipeline_events",
      modelName: "pipelineEvent",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<PipelineEventInstance> & {
    associate?: (models: any) => void;
  };

  PipelineEvent.associate = (models: any) => {
    PipelineEvent.belongsTo(models.jobApplication, {
      foreignKey: "applicationId",
      as: "application",
    });

    PipelineEvent.belongsTo(models.user, {
      foreignKey: "triggeredById",
      as: "triggeredBy",
    });
  };

  return PipelineEvent;
}