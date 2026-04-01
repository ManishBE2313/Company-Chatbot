"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface EmployeeAttributes {
  id: string;
  firstName: string;
  lastName: string;
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
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "first_name",
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "last_name",
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