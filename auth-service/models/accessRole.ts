"use strict";
import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

export interface AccessRoleAttributes {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  isSystem?: boolean;
}

export interface AccessRoleInstance extends Model<AccessRoleAttributes>, AccessRoleAttributes {}

export default function AccessRoleModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<AccessRoleInstance> & {
  associate?: (models: any) => void;
} {
  const AccessRole = sequelize.define<AccessRoleInstance>(
    "accessRole",
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isSystem: {
        type: DataTypes.BOOLEAN,
        field: "is_system",
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "auth_access_roles",
      modelName: "accessRole",
      schema,
      timestamps: true,
      indexes: [{ unique: true, fields: ["organization_id", "name"] }],
    }
  ) as ModelStatic<AccessRoleInstance> & {
    associate?: (models: any) => void;
  };

  AccessRole.associate = (models: any) => {
    AccessRole.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
  };

  return AccessRole;
}