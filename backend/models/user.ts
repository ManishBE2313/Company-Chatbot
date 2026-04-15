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
  workEmail?: string | null;
  designation?: string | null;
  band?: string | null;
  location?: string | null;
  profileCompleted?: boolean;
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
      workEmail: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        field: "work_email",
      },
      designation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      band: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profileCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "profile_completed",
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
    User.hasOne(models.employeeContact, { foreignKey: "employeeId", as: "employeeContact" });
    User.hasOne(models.employeePersonal, { foreignKey: "employeeId", as: "employeePersonal" });
    User.hasOne(models.employeeWork, { foreignKey: "employeeId", as: "employeeWork" });
    User.hasOne(models.employeeEmergency, { foreignKey: "employeeId", as: "employeeEmergency" });
    User.hasMany(models.employeeEducation, { foreignKey: "employeeId", as: "employeeEducations" });
    User.hasMany(models.timesheet, { foreignKey: "employeeId", as: "timesheets" });
    User.hasMany(models.interviewSlot, { foreignKey: "interviewerId", as: "slots" });
    User.hasMany(models.interview, { foreignKey: "interviewerId", as: "interviews" });
    User.hasMany(models.interviewPanel, { foreignKey: "createdBy", as: "createdPanels" });
    User.hasMany(models.interviewPanelMember, { foreignKey: "userId", as: "panelMemberships" });
  };

  return User;
}
