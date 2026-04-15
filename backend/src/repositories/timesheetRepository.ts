import { Op } from "sequelize";
import { Timesheet, TimesheetEntry, User } from "../config/database";

export class TimesheetRepository {
  public static async findEmployeeById(id: string) {
    return User.findByPk(id);
  }

  public static async findEmployeeByEmail(email: string) {
    return User.findOne({
      where: {
        [Op.or]: [{ email }, { workEmail: email }],
      },
    });
  }

  public static async findByEmployeeIdAndWeek(employeeId: string, weekEnding: string) {
    return Timesheet.findOne({ where: { employeeId, weekEnding } });
  }

  public static async findReviewMonths() {
    return Timesheet.findAll({
      attributes: ["claimMonth"],
      include: [
        {
          model: User,
          as: "employee",
          attributes: [],
          where: {
            status: "active",
            isActive: true,
          },
          required: true,
        },
      ],
      group: ["claimMonth"],
      order: [["claimMonth", "DESC"]],
    });
  }

  public static async findTimesheetsForReview(claimMonth: string) {
    return Timesheet.findAll({
      where: { claimMonth },
      include: [
        {
          model: User,
          as: "employee",
          attributes: ["id", "firstName", "lastName", "email", "workEmail", "designation", "status", "isActive"],
          where: {
            status: "active",
            isActive: true,
          },
          required: true,
        },
        {
          model: TimesheetEntry,
          as: "entries",
        },
      ],
      order: [["weekEnding", "DESC"]],
    });
  }

  public static async createTimesheet(data: any, transaction: any) {
    return Timesheet.create(data, { transaction });
  }

  public static async updateTimesheet(id: string, data: any, transaction: any) {
    const timesheet = await Timesheet.findByPk(id, { transaction });
    if (!timesheet) throw new Error("Timesheet not found");
    return timesheet.update(data, { transaction });
  }

  public static async updateTimesheetStatus(id: string, data: any) {
    const timesheet = await Timesheet.findByPk(id);
    if (!timesheet) throw new Error("Timesheet not found");
    return timesheet.update(data);
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
