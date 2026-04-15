import { getTransaction, Timesheet, TimesheetEntry } from "../config/database";
import { TimesheetRepository } from "../repositories/timesheetRepository";

export class TimesheetService {
  private static readonly ENTRY_DAY_ORDER: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  public static async saveTimesheet(employeeId: string, form: any) {
    const employee = await TimesheetRepository.findEmployeeById(employeeId);
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

  public static async getTimesheetByEmployeeId(employeeId: string) {
    const employee = await TimesheetRepository.findEmployeeById(employeeId);
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

  public static async getTimesheetsForReview(claimMonth?: string) {
    const reviewMonths = await TimesheetRepository.findReviewMonths();
    const availableMonths = reviewMonths
      .map((item: any) => item.claimMonth)
      .filter((value: string | undefined): value is string => Boolean(value));

    const defaultMonth = availableMonths[0] || new Date().toISOString().slice(0, 7);
    const selectedMonth = claimMonth && availableMonths.includes(claimMonth) ? claimMonth : defaultMonth;

    if (!selectedMonth) {
      return {
        availableMonths,
        selectedMonth: "",
        timesheets: [],
      };
    }

    const timesheets = await TimesheetRepository.findTimesheetsForReview(selectedMonth);

    return {
      availableMonths,
      selectedMonth,
      timesheets: timesheets.map((timesheet: any) => ({
        id: timesheet.id,
        employeeId: timesheet.employeeId,
        employeeName: [timesheet.employee?.firstName, timesheet.employee?.lastName].filter(Boolean).join(" "),
        employeeEmail: timesheet.employee?.workEmail || timesheet.employee?.email || "",
        designation: timesheet.employee?.designation || "",
        weekEnding: timesheet.weekEnding,
        claimMonth: timesheet.claimMonth,
        status: timesheet.status,
        remarks: timesheet.remarks || "",
        totalHours: timesheet.totalHours,
        averageHours: timesheet.averageHours,
        entries: (timesheet.entries || [])
          .map((entry: any) => ({
            id: entry.id,
            dayName: entry.dayName,
            hours: entry.hours,
            dayDate: entry.dayDate,
          }))
          .sort((a: any, b: any) => {
            return (
              (TimesheetService.ENTRY_DAY_ORDER[a.dayName] || Number.MAX_SAFE_INTEGER) -
              (TimesheetService.ENTRY_DAY_ORDER[b.dayName] || Number.MAX_SAFE_INTEGER)
            );
          }),
      })),
    };
  }

  public static async reviewTimesheet(timesheetId: string, status: "approved" | "rejected", remarks?: string) {
    const updated = await TimesheetRepository.updateTimesheetStatus(timesheetId, {
      status,
      remarks: remarks ?? "",
    });

    return updated.toJSON();
  }
}
