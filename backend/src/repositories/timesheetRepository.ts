import { Timesheet, TimesheetEntry, Employee } from "../config/database";

export class TimesheetRepository {
  public static async findEmployeeByEmail(email: string) {
    return Employee.findOne({ where: { workEmail: email } });
  }

  public static async findByEmployeeIdAndWeek(employeeId: string, weekEnding: string) {
    return Timesheet.findOne({ where: { employeeId, weekEnding } });
  }

  public static async createTimesheet(data: any, transaction: any) {
    return Timesheet.create(data, { transaction });
  }

  public static async updateTimesheet(id: string, data: any, transaction: any) {
    const timesheet = await Timesheet.findByPk(id, { transaction });
    if (!timesheet) throw new Error("Timesheet not found");
    return timesheet.update(data, { transaction });
  }

  public static async deleteEntriesByTimesheet(timesheetId: string, transaction: any) {
    return TimesheetEntry.destroy({ where: { timesheetId }, transaction });
  }

  public static async bulkCreateEntries(entries: any[], transaction: any) {
    return TimesheetEntry.bulkCreate(entries, { transaction });
  }

  public static async findTimesheetById(timesheetId: string) {
    return Timesheet.findByPk(timesheetId, {
      include: [{ model: TimesheetEntry, as: "entries" }],
    });
  }
}
