"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface TimesheetEntryAttributes {
  id: string;
  timesheetId: string;
  dayName: string;
  hours: number;
  dayDate?: string;
}

export interface TimesheetEntryInstance
  extends Model<TimesheetEntryAttributes>,
    TimesheetEntryAttributes {}

export type TimesheetEntryModelType = ModelStatic<TimesheetEntryInstance> & {
  associate?: (models: any) => void;
};

export default function TimesheetEntryModel(
  sequelize: Sequelize
): TimesheetEntryModelType {
  const TimesheetEntry = sequelize.define<TimesheetEntryInstance>(
    "timesheetEntry",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      timesheetId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "timesheet_id",
      },
      dayName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "day_name",
      },
      hours: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      dayDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "day_date",
      },
    },
    {
      tableName: "timesheet_entries",
      timestamps: true,
    }
  ) as TimesheetEntryModelType;

  TimesheetEntry.associate = (models: any) => {
    TimesheetEntry.belongsTo(models.timesheet, {
      foreignKey: "timesheetId",
      as: "timesheet",
    });
  };

  return TimesheetEntry;
}
