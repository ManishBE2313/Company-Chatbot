"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface InterviewPanelMemberAttributes {
  id: string;
  organizationId: string;
  panelId: string;
  userId: string;
  roleInPanel?: string | null;
  loadWeight?: number | null;
  assignedAt?: Date | null;
}

export interface InterviewPanelMemberInstance extends Model<InterviewPanelMemberAttributes>, InterviewPanelMemberAttributes {}

export default function InterviewPanelMemberModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<InterviewPanelMemberInstance> & {
  associate?: (models: any) => void;
} {
  const InterviewPanelMember = sequelize.define<InterviewPanelMemberInstance>(
    "interviewPanelMember",
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
      panelId: {
        type: DataTypes.UUID,
        field: "panel_id",
        allowNull: false,
        references: {
          model: "interview_panels",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.UUID,
        field: "user_id",
        allowNull: false,
        references: {
          model: "employees",
          key: "id",
        },
      },
      roleInPanel: {
        type: DataTypes.STRING,
        field: "role_in_panel",
        allowNull: true,
      },
      loadWeight: {
        type: DataTypes.FLOAT,
        field: "load_weight",
        allowNull: true,
      },
      assignedAt: {
        type: DataTypes.DATE,
        field: "assigned_at",
        allowNull: true,
      },
    },
    {
      tableName: "interview_panel_members",
      modelName: "interviewPanelMember",
      schema,
      timestamps: true,
      indexes: [{ unique: true, fields: ["organization_id", "panel_id", "user_id"] }],
    }
  ) as ModelStatic<InterviewPanelMemberInstance> & {
    associate?: (models: any) => void;
  };

  InterviewPanelMember.associate = (models: any) => {
    InterviewPanelMember.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    InterviewPanelMember.belongsTo(models.interviewPanel, { foreignKey: "panelId", as: "panel" });
    InterviewPanelMember.belongsTo(models.user, { foreignKey: "userId", as: "employee" });
  };

  return InterviewPanelMember;
}
