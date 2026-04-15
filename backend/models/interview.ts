"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface InterviewAttributes {
  id: string;
  organizationId: string;
  applicationId: string;
  interviewerId: string;
  slotId: string;
  roundName: string;
  meetLink?: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
}

export interface InterviewInstance extends Model<InterviewAttributes>, InterviewAttributes {}

export default function InterviewModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<InterviewInstance> & {
  associate?: (models: any) => void;
} {
  const Interview = sequelize.define<InterviewInstance>(
    "interview",
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
      applicationId: {
        type: DataTypes.UUID,
        field: "application_id",
        allowNull: false,
        references: {
          model: "job_applications",
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
      slotId: {
        type: DataTypes.UUID,
        field: "slot_id",
        allowNull: false,
        references: {
          model: "interview_slots",
          key: "id",
        },
      },
      roundName: {
        type: DataTypes.STRING,
        field: "round_name",
        allowNull: false,
      },
      meetLink: {
        type: DataTypes.STRING,
        field: "meet_link",
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("SCHEDULED", "COMPLETED", "CANCELED", "NO_SHOW"),
        defaultValue: "SCHEDULED",
      },
    },
    {
      tableName: "interviews",
      modelName: "interview",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<InterviewInstance> & {
    associate?: (models: any) => void;
  };

  Interview.associate = (models: any) => {
    Interview.belongsTo(models.organization, {
      foreignKey: "organizationId",
      as: "organization",
    });
    Interview.belongsTo(models.jobApplication, {
      foreignKey: "applicationId",
      as: "application",
    });
    Interview.belongsTo(models.user, {
      foreignKey: "interviewerId",
      as: "interviewer",
    });
    Interview.belongsTo(models.interviewSlot, {
      foreignKey: "slotId",
      as: "slot",
    });
    Interview.hasOne(models.scorecard, {
      foreignKey: "interviewId",
      as: "scorecard",
    });
  };

  return Interview;
}
