"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface InterviewSlotAttributes {
  id: string;
  organizationId: string;
  interviewerId: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
}

export interface InterviewSlotInstance extends Model<InterviewSlotAttributes>, InterviewSlotAttributes {}

export default function InterviewSlotModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<InterviewSlotInstance> & {
  associate?: (models: any) => void;
} {
  const InterviewSlot = sequelize.define<InterviewSlotInstance>(
    "interviewSlot",
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
      interviewerId: {
        type: DataTypes.UUID,
        field: "interviewer_id",
        allowNull: false,
        references: {
          model: "employees",
          key: "id",
        },
      },
      startTime: {
        type: DataTypes.DATE,
        field: "start_time",
        allowNull: false,
      },
      endTime: {
        type: DataTypes.DATE,
        field: "end_time",
        allowNull: false,
      },
      isBooked: {
        type: DataTypes.BOOLEAN,
        field: "is_booked",
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      tableName: "interview_slots",
      modelName: "interviewSlot",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<InterviewSlotInstance> & {
    associate?: (models: any) => void;
  };

  InterviewSlot.associate = (models: any) => {
    InterviewSlot.belongsTo(models.organization, {
      foreignKey: "organizationId",
      as: "organization",
    });
    InterviewSlot.belongsTo(models.user, {
      foreignKey: "interviewerId",
      as: "interviewer",
    });
    InterviewSlot.hasOne(models.interview, {
      foreignKey: "slotId",
      as: "interview",
    });
  };

  return InterviewSlot;
}
