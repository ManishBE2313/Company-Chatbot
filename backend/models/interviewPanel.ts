"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface InterviewPanelAttributes {
  id: string;
  organizationId: string;
  requisitionId?: string | null;
  name: string;
  status?: "active" | "inactive";
  createdBy?: string | null;
}

export interface InterviewPanelInstance extends Model<InterviewPanelAttributes>, InterviewPanelAttributes {
  members?: any[];
}

export default function InterviewPanelModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<InterviewPanelInstance> & {
  associate?: (models: any) => void;
} {
  const InterviewPanel = sequelize.define<InterviewPanelInstance>(
    "interviewPanel",
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
      requisitionId: {
        type: DataTypes.UUID,
        field: "requisition_id",
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
      createdBy: {
        type: DataTypes.UUID,
        field: "created_by",
        allowNull: true,
        references: {
          model: "employees",
          key: "id",
        },
      },
    },
    {
      tableName: "interview_panels",
      modelName: "interviewPanel",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<InterviewPanelInstance> & {
    associate?: (models: any) => void;
  };

  InterviewPanel.associate = (models: any) => {
    InterviewPanel.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    InterviewPanel.belongsTo(models.user, { foreignKey: "createdBy", as: "creator" });
    InterviewPanel.hasMany(models.interviewPanelMember, { foreignKey: "panelId", as: "members" });
    InterviewPanel.hasMany(models.job, { foreignKey: "panelId", as: "jobs" });
  };

  return InterviewPanel;
}

