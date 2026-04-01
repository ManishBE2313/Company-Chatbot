"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface EmployeeRoleAttributes {
  id: string;
  organizationId: string;
  userId: string;
  roleId: string;
  departmentId?: string | null;
}

export interface EmployeeRoleInstance extends Model<EmployeeRoleAttributes>, EmployeeRoleAttributes {}

export default function EmployeeRoleModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<EmployeeRoleInstance> & {
  associate?: (models: any) => void;
} {
  const EmployeeRole = sequelize.define<EmployeeRoleInstance>(
    "employeeRole",
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
      userId: {
        type: DataTypes.UUID,
        field: "user_id",
        allowNull: false,
        references: {
          model: "employees",
          key: "id",
        },
      },
      roleId: {
        type: DataTypes.UUID,
        field: "role_id",
        allowNull: false,
        references: {
          model: "access_roles",
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
    },
    {
      tableName: "employee_roles",
      modelName: "employeeRole",
      schema,
      timestamps: true,
      indexes: [{ unique: true, fields: ["organization_id", "user_id", "role_id", "department_id"] }],
    }
  ) as ModelStatic<EmployeeRoleInstance> & {
    associate?: (models: any) => void;
  };

  EmployeeRole.associate = (models: any) => {
    EmployeeRole.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    EmployeeRole.belongsTo(models.user, { foreignKey: "userId", as: "employee" });
    EmployeeRole.belongsTo(models.accessRole, { foreignKey: "roleId", as: "role" });
    EmployeeRole.belongsTo(models.department, { foreignKey: "departmentId", as: "department" });
  };

  return EmployeeRole;
}
