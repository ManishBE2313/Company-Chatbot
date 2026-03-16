"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export type UserRole = "user" | "admin" | "superadmin";

export interface UserAttributes {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UserInstance extends Model<UserAttributes>, UserAttributes {}

export default function UserModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<UserInstance> & {
  associate?: (models: any) => void;
} {
  return sequelize.define<UserInstance>(
    "user",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
        unique: true,
      },
      role: {
        type: DataTypes.ENUM("user", "admin", "superadmin"),
        allowNull: false,
        defaultValue: "user",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
      },
    },
    {
      tableName: "users",
      modelName: "user",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<UserInstance> & {
    associate?: (models: any) => void;
  };
}
