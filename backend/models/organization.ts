"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID, DEFAULT_ORGANIZATION_NAME } from "../src/constants/system";

export interface OrganizationAttributes {
  id: string;
  name: string;
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
        defaultValue: DEFAULT_ORGANIZATION_ID,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: DEFAULT_ORGANIZATION_NAME,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      tableName: "organizations",
      modelName: "organization",
      schema,
      timestamps: true,
      underscored: true,
    }
  ) as ModelStatic<OrganizationInstance> & {
    associate?: (models: any) => void;
  };

  Organization.associate = (models: any) => {
    Organization.hasMany(models.department, { foreignKey: "organizationId", as: "departments" });
    Organization.hasMany(models.location, { foreignKey: "organizationId", as: "locations" });
    Organization.hasMany(models.user, { foreignKey: "organizationId", as: "employees" });
    Organization.hasMany(models.accessRole, { foreignKey: "organizationId", as: "roles" });
    Organization.hasMany(models.skill, { foreignKey: "organizationId", as: "skills" });
    Organization.hasMany(models.jobRole, { foreignKey: "organizationId", as: "jobRoles" });
    Organization.hasMany(models.job, { foreignKey: "organizationId", as: "jobs" });
    Organization.hasMany(models.interviewPanel, { foreignKey: "organizationId", as: "interviewPanels" });
  };

  return Organization;
}
