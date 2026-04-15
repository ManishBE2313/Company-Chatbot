"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface EmployeeAttributes {
  id: string;
  name: string;
  email: string;
  managerId?: string | null;
  department?: string | null;
  role?: string | null;
  location?: string | null;
}

export interface EmployeeInstance extends Model<EmployeeAttributes>, EmployeeAttributes {}

export default function EmployeeModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<EmployeeInstance> & { associate?: (models: any) => void } {
  const Employee = sequelize.define<EmployeeInstance>(
    "employee",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      managerId: {
        type: DataTypes.UUID,
        field: "manager_id",
        allowNull: true,
        references: {
          model: "employees",
          key: "id",
        },
      },
      department: DataTypes.TEXT,
      role: DataTypes.TEXT,
      location: DataTypes.TEXT,
    },
    {
      tableName: "employees",
      modelName: "employee",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<EmployeeInstance> & { associate?: (models: any) => void };

  Employee.associate = (models: any) => {
    Employee.belongsTo(models.employee, { foreignKey: "managerId", as: "manager" });
    Employee.hasMany(models.employee, { foreignKey: "managerId", as: "subordinates" });

    Employee.hasMany(models.response, { foreignKey: "employeeId", as: "responses" });
  };

  return Employee;
}