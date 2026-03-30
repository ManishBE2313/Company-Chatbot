import { User } from "../config/database";
import {
  Employee,
  EmployeeContact,
  EmployeePersonal,
  EmployeeWork,
  EmployeeEmergency,
  EmployeeEducation,
} from "../config/database";

export class EmployeeRepository {
public static async findByWorkEmail(email: string) {
  console.log("yaha")
    return await User.findOne({
         where: { email : email },
    });
  }
  // 🔹 CREATE MAIN EMPLOYEE
  public static async createEmployee(data: any, transaction: any) {
    return Employee.create(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        designation: data.designation,
        band: data.band,
        location: data.location,
        workEmail: data.workEmail,
      },
      { transaction }
    );
  }



  // 🔹 CONTACT
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



  // 🔹 PERSONAL
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



  // 🔹 WORK
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



  // 🔹 EMERGENCY
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



  // 🔹 EDUCATION (BULK)
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



  // 🔹 FIND BY ID (with relations)
  public static async findById(id: string) {
    return Employee.findByPk(id, {
      include: [
        { model: EmployeeContact },
        { model: EmployeePersonal },
        { model: EmployeeWork },
        { model: EmployeeEmergency },
        { model: EmployeeEducation },
      ],
    });
  }



  // 🔹 FIND ALL
  public static async findAll() {
    return Employee.findAll({
      attributes: ["id", "firstName", "lastName", "designation", "workEmail"],
      order: [["createdAt", "DESC"]],
    });
  }



  // 🔹 UPDATE
  public static async updateEmployee(id: string, data: any) {
    const employee = await Employee.findByPk(id);

    if (!employee) {
      throw new Error("Employee not found");
    }

    await employee.update(data);
    return employee;
  }



  // 🔹 DELETE
  public static async deleteEmployee(id: string) {
    const employee = await Employee.findByPk(id);

    if (!employee) {
      throw new Error("Employee not found");
    }

    await employee.destroy();
  }
}