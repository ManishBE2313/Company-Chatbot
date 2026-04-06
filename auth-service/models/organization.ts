"use strict";
import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

export interface OrganizationAttributes {
  id: string;
  name: string;
  tenantId: string;
  primaryDomain?: string | null;
  status: "active" | "inactive";
}

export interface OrganizationInstance extends Model<OrganizationAttributes>, OrganizationAttributes {}

export default function OrganizationModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<OrganizationInstance> & {
  associate?: (models: any) => void;
} {
  const Organization = sequelize.define<OrganizationInstance>(
    "organization",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tenantId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "tenant_id",
      },
      primaryDomain: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "primary_domain",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      tableName: "auth_organizations",
      modelName: "organization",
      schema,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["tenant_id"] },
        { fields: ["primary_domain"] },
      ],
    }
  ) as ModelStatic<OrganizationInstance> & {
    associate?: (models: any) => void;
  };

  Organization.associate = (models: any) => {
    Organization.hasMany(models.user, { foreignKey: "organizationId", as: "users" });
    Organization.hasMany(models.accessRole, { foreignKey: "organizationId", as: "roles" });
  };

  return Organization;
}