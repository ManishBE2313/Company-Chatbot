import { getTransaction, Timesheet, TimesheetEntry } from "../config/database";
import { TimesheetRepository } from "../repositories/timesheetRepository";

export class TimesheetService {
  public static async saveTimesheet(employeeEmail: string, form: any) {
    const employee = await TimesheetRepository.findEmployeeByEmail(employeeEmail);
    if (!employee) {
      throw new Error("Employee not found");
    }

    const hours = form.hours || {};
    const values = [
      parseFloat(hours.day1) || 0,
      parseFloat(hours.day2) || 0,
      parseFloat(hours.day3) || 0,
      parseFloat(hours.day4) || 0,
      parseFloat(hours.day5) || 0,
      parseFloat(hours.day6) || 0,
      parseFloat(hours.day7) || 0,
    ];
    const total = values.reduce((acc, cur) => acc + cur, 0);
    const avg = total / 7;

    const weekEnding = form.weekEnding;
    const claimMonth = form.claimMonth;
    const status = form.status || "submitted";
    const remarks = form.remarks || "";

    const transaction = await getTransaction();

    try {
      const existing = await TimesheetRepository.findByEmployeeIdAndWeek(employee.id, weekEnding);
      let timesheet;
      const timesheetPayload = {
        employeeId: employee.id,
        weekEnding,
        claimMonth,
        status,
        remarks,
        totalHours: total,
        averageHours: avg,
      };

      if (existing) {
        timesheet = await TimesheetRepository.updateTimesheet(existing.id, timesheetPayload, transaction);
        await TimesheetRepository.deleteEntriesByTimesheet(timesheet.id, transaction);
      } else {
        timesheet = await TimesheetRepository.createTimesheet(timesheetPayload, transaction);
      }

      const entries = [
        { timesheetId: timesheet.id, dayName: "Monday", hours: values[0] },
        { timesheetId: timesheet.id, dayName: "Tuesday", hours: values[1] },
        { timesheetId: timesheet.id, dayName: "Wednesday", hours: values[2] },
        { timesheetId: timesheet.id, dayName: "Thursday", hours: values[3] },
        { timesheetId: timesheet.id, dayName: "Friday", hours: values[4] },
        { timesheetId: timesheet.id, dayName: "Saturday", hours: values[5] },
        { timesheetId: timesheet.id, dayName: "Sunday", hours: values[6] },
      ];

      await TimesheetRepository.bulkCreateEntries(entries, transaction);
      await transaction.commit();

      return {
        ...timesheet.toJSON(),
        entries,
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  public static async getTimesheetByEmployeeEmail(employeeEmail: string) {
    const employee = await TimesheetRepository.findEmployeeByEmail(employeeEmail);
    if (!employee) return null;

    const timesheets = await Timesheet.findAll({
      where: { employeeId: employee.id },
      include: [{ model: TimesheetEntry, as: "entries" }],
      order: [["weekEnding", "DESC"]],
    });

    return {
      employee,
      timesheets,
    };
  }
}
