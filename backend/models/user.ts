"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export type UserRole = "user" | "admin" | "superadmin" | "interviewer";
export type EmployeeStatus = "active" | "inactive" | "invited";

export interface UserAttributes {
  id: string;
  organizationId: string;
  departmentId?: string | null;
  firstName: string;
  lastName?: string | null;
  email: string;
  passwordHash?: string | null;
  role: UserRole;
  status: EmployeeStatus;
  lastLoginAt?: Date | null;
  isActive?: boolean;
}

export interface UserInstance extends Model<UserAttributes>, UserAttributes {}

export default function UserModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<UserInstance> & {
  associate?: (models: any) => void;
} {
  const User = sequelize.define<UserInstance>(
    "user",
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
      departmentId: {
        type: DataTypes.UUID,
        field: "department_id",
        allowNull: true,
        references: {
          model: "departments",
          key: "id",
        },
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "first_name",
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "last_name",
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "password_hash",
      },
      role: {
        type: DataTypes.ENUM("user", "admin", "superadmin", "interviewer"),
        allowNull: false,
        defaultValue: "user",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "invited"),
        allowNull: false,
        defaultValue: "active",
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "last_login_at",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
      },
    },
    {
      tableName: "employees",
      modelName: "user",
      schema,
      timestamps: true,
      indexes: [{ unique: true, fields: ["organization_id", "email"] }],
    }
  ) as ModelStatic<UserInstance> & {
    associate?: (models: any) => void;
  };

  User.associate = (models: any) => {
    User.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    User.belongsTo(models.department, { foreignKey: "departmentId", as: "department" });
    User.hasMany(models.employeeRole, { foreignKey: "userId", as: "roleAssignments" });
    User.hasMany(models.interviewSlot, { foreignKey: "interviewerId", as: "slots" });
    User.hasMany(models.interview, { foreignKey: "interviewerId", as: "interviews" });
    User.hasMany(models.interviewPanel, { foreignKey: "createdBy", as: "createdPanels" });
    User.hasMany(models.interviewPanelMember, { foreignKey: "userId", as: "panelMemberships" });
  };

  return User;
}
