"use strict";
import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

export type UserRole = "user" | "admin" | "superadmin" | "interviewer";
export type EmployeeStatus = "active" | "inactive" | "invited";

export interface UserAttributes {
  id: string;
  organizationId: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  role: UserRole;
  status: EmployeeStatus;
  isActive?: boolean;
  microsoftOid: string;
  tenantId: string;
  lastLoginAt?: Date | null;
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
        references: {
          model: "auth_organizations",
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
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
      },
      microsoftOid: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "microsoft_oid",
      },
      tenantId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "tenant_id",
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "last_login_at",
      },
    },
    {
      tableName: "auth_users",
      modelName: "user",
      schema,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["organization_id", "email"] },
        { unique: true, fields: ["tenant_id", "microsoft_oid"] },
      ],
    }
  ) as ModelStatic<UserInstance> & {
    associate?: (models: any) => void;
  };

  User.associate = (models: any) => {
    User.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    User.hasMany(models.refreshToken, { foreignKey: "userId", as: "refreshTokens" });
  };

  return User;
}