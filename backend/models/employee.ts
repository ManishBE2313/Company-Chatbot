"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface EmployeeAttributes {
  id: string;
  organizationId?: string;
  departmentId?: string | null;
  firstName: string;
  lastName?: string | null;
  email?: string;
  role?: "user" | "admin" | "superadmin" | "interviewer";
  status?: "active" | "inactive" | "invited";
  isActive?: boolean;
  designation?: string;
  band?: string;
  location?: string;
  workEmail: string;
  profileCompleted: boolean; 
}

export interface EmployeeInstance
  extends Model<EmployeeAttributes>,
    EmployeeAttributes {}


type EmployeeModelType = ModelStatic<EmployeeInstance> & {
  associate?: (models: any) => void;
};

export default function EmployeeModel(
  sequelize: Sequelize
): EmployeeModelType {
  
  const Employee = sequelize.define<EmployeeInstance>(
    "employee",
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
        field: "work_email",
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
      designation: {
        type: DataTypes.STRING,
      },
      band: {
        type: DataTypes.STRING,
      },
      location: {
        type: DataTypes.STRING,
      },
      workEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "work_email",
      },
       profileCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "profile_completed",
    },
    },
    {
      tableName: "employees",
      timestamps: true,
      indexes: [{ unique: true, fields: ["organization_id", "work_email"] }],
    }
  ) as EmployeeModelType;


  Employee.associate = (models: any) => {
    Employee.hasOne(models.employeeContact, { foreignKey: "employeeId" });
    Employee.hasOne(models.employeePersonal, { foreignKey: "employeeId" });
    Employee.hasOne(models.employeeWork, { foreignKey: "employeeId" });
    Employee.hasOne(models.employeeEmergency, { foreignKey: "employeeId" });
    Employee.hasMany(models.employeeEducation, { foreignKey: "employeeId" });
    Employee.hasMany(models.timesheet, { foreignKey: "employeeId", as: "timesheets" });
  };

  return Employee;
}
