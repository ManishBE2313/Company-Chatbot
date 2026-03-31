"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface DepartmentAttributes {
  id: string;
  organizationId: string;
  name: string;
  costCenterCode?: string | null;
  parentDepartmentId?: string | null;
}

export interface DepartmentInstance extends Model<DepartmentAttributes>, DepartmentAttributes {}

export default function DepartmentModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<DepartmentInstance> & {
  associate?: (models: any) => void;
} {
  const Department = sequelize.define<DepartmentInstance>(
    "department",
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      costCenterCode: {
        type: DataTypes.STRING,
        field: "cost_center_code",
        allowNull: true,
      },
      parentDepartmentId: {
        type: DataTypes.UUID,
        field: "parent_department_id",
        allowNull: true,
      },
    },
    {
      tableName: "departments",
      modelName: "department",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<DepartmentInstance> & {
    associate?: (models: any) => void;
  };

  Department.associate = (models: any) => {
    Department.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    Department.belongsTo(models.department, { foreignKey: "parentDepartmentId", as: "parentDepartment" });
    Department.hasMany(models.department, { foreignKey: "parentDepartmentId", as: "childDepartments" });
    Department.hasMany(models.user, { foreignKey: "departmentId", as: "employees" });
    Department.hasMany(models.job, { foreignKey: "departmentId", as: "jobs" });
  };

  return Department;
}
