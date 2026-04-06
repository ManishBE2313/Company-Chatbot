"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface TimesheetAttributes {
  id: string;
  employeeId: string;
  weekEnding: string;
  claimMonth: string;
  status: "pending" | "submitted" | "approved" | "rejected" | "";
  remarks?: string;
  totalHours: number;
  averageHours: number;
}

export interface TimesheetInstance
  extends Model<TimesheetAttributes>,
    TimesheetAttributes {}

export type TimesheetModelType = ModelStatic<TimesheetInstance> & {
  associate?: (models: any) => void;
};

export default function TimesheetModel(
  sequelize: Sequelize
): TimesheetModelType {
  const Timesheet = sequelize.define<TimesheetInstance>(
    "timesheet",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      employeeId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "employee_id",
      },
      weekEnding: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "week_ending",
      },
      claimMonth: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "claim_month",
      },
      status: {
        type: DataTypes.ENUM("pending", "submitted", "approved", "rejected", ""),
        defaultValue: "pending",
      },
      remarks: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      totalHours: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        field: "total_hours",
      },
      averageHours: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        field: "average_hours",
      },
    },
    {
      tableName: "timesheets",
      timestamps: true,
    }
  ) as TimesheetModelType;

  Timesheet.associate = (models: any) => {
    Timesheet.belongsTo(models.user, {
      foreignKey: "employeeId",
      as: "employee",
    });
    Timesheet.hasMany(models.timesheetEntry, {
      foreignKey: "timesheetId",
      as: "entries",
    });
  };

  return Timesheet;
}
