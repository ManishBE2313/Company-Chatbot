import { Op } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../constants/system";
import {
  User,
  EmployeeContact,
  EmployeePersonal,
  EmployeeWork,
  EmployeeEmergency,
  EmployeeEducation,
} from "../config/database";

export class EmployeeRepository {
  public static async findByWorkEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    return User.findOne({
      where: {
        [Op.or]: [{ email: normalizedEmail }, { workEmail: normalizedEmail }],
      },
    });
  }

  public static async createEmployee(data: any, transaction: any) {
    const normalizedEmail = String(data.email || data.workEmail || "").trim().toLowerCase();

    return User.create(
      {
        organizationId: data.organizationId || DEFAULT_ORGANIZATION_ID,
        firstName: data.firstName,
        lastName: data.lastName,
        email: normalizedEmail,
        workEmail: data.workEmail || normalizedEmail,
        designation: data.designation,
        band: data.band,
        location: data.location,
        profileCompleted: data.profileCompleted ?? false,
        role: data.role || "user",
        status: data.status || "active",
        isActive: data.isActive ?? true,
      },
      { transaction }
    );
  }

  public static async createContact(
    employeeId: string,
    contact: any,
    transaction: any
  ) {
    return EmployeeContact.create(
      {
        employeeId,
        personalEmail: contact.personalEmail,
        phone: contact.phone,
        city: contact.city,
        address: contact.address,
      },
      { transaction }
    );
  }

  public static async createPersonal(
    employeeId: string,
    personal: any,
    transaction: any
  ) {
    return EmployeePersonal.create(
      {
        employeeId,
        nationality: personal.nationality,
        dob: personal.dob,
        bloodGroup: personal.bloodGroup,
        maritalStatus: personal.maritalStatus,
        aadhar: personal.aadhar,
        pan: personal.pan,
        uan: personal.uan,
        passport: personal.passport,
      },
      { transaction }
    );
  }

  public static async createWork(
    employeeId: string,
    work: any,
    transaction: any
  ) {
    return EmployeeWork.create(
      {
        employeeId,
        reportingManager: work.reportingManager,
        dateOfJoining: work.dateOfJoining,
        annualCompensation: work.annualCompensation,
      },
      { transaction }
    );
  }

  public static async createEmergency(
    employeeId: string,
    emergency: any,
    transaction: any
  ) {
    return EmployeeEmergency.create(
      {
        employeeId,
        name: emergency.name,
        relation: emergency.relation,
        phone: emergency.phone,
      },
      { transaction }
    );
  }

  public static async createEducation(
    employeeId: string,
    educationList: any[],
    transaction: any
  ) {
    const records = educationList.map((edu) => ({
      employeeId,
      type: edu.type,
      institute: edu.institute,
      year: edu.year,
      percentage: edu.percentage,
    }));

    return EmployeeEducation.bulkCreate(records, { transaction });
  }

  public static async findById(id: string) {
    return User.findByPk(id, {
      include: [
        { model: EmployeeContact, as: "employeeContact" },
        { model: EmployeePersonal, as: "employeePersonal" },
        { model: EmployeeWork, as: "employeeWork" },
        { model: EmployeeEmergency, as: "employeeEmergency" },
        { model: EmployeeEducation, as: "employeeEducations" },
      ],
    });
  }

  public static async findAll() {
    return User.findAll({
      attributes: ["id", "firstName", "lastName", "email", "workEmail", "designation", "band", "location", "profileCompleted"],
      order: [["createdAt", "DESC"]],
    });
  }

  public static async updateEmployee(id: string, data: any) {
    const employee = await User.findByPk(id);

    if (!employee) {
      throw new Error("Employee not found");
    }

    await employee.update(data);
    return employee;
  }

  public static async deleteEmployee(id: string) {
    const employee = await User.findByPk(id);

    if (!employee) {
      throw new Error("Employee not found");
    }

    await employee.destroy();
  }
}
