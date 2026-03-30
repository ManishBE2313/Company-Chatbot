
import { EmployeeRepository }from "../repositories/employeeRepository";
import {
  Employee,
  EmployeeContact,
  EmployeePersonal,
  EmployeeWork,
  EmployeeEmergency,
  EmployeeEducation,
} from "../config/database";
import { sequelize } from "../config/database";


export class EmployeeService {

  //  CREATE FULL EMPLOYEE (TRANSACTION)
  public static async createEmployee(data: any) {
    const transaction = await sequelize.transaction();

    try {
      //  1. Create main employee
      const employee = await EmployeeRepository.createEmployee(data, transaction);
      const employeeId = employee.id;

      //  2. Related tables
      if (data.contact) {
        await EmployeeRepository.createContact(employeeId, data.contact, transaction);
      }

      if (data.personal) {
        await EmployeeRepository.createPersonal(employeeId, data.personal, transaction);
      }

      if (data.work) {
        await EmployeeRepository.createWork(employeeId, data.work, transaction);
      }

      if (data.emergency) {
        await EmployeeRepository.createEmergency(employeeId, data.emergency, transaction);
      }

      //  3. Education (multiple)
      if (data.education?.length) {
        await EmployeeRepository.createEducation(
          employeeId,
          data.education,
          transaction
        );
      }

      await transaction.commit();

      return employee;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }



  //  GET ALL EMPLOYEES
  public static async getAllEmployees() {
    return Employee.findAll({
      attributes: ["id", "firstName", "lastName", "designation", "workEmail"],
      order: [["createdAt", "DESC"]],
    });
  }



  //  GET SINGLE EMPLOYEE (FULL DETAILS)
  public static async getEmployeeByEmail(email: string) {
  console.log("reached service")
  let employee = await Employee.findOne({
    where: { workEmail: email },
    include: [
      { model: EmployeeContact },
      { model: EmployeePersonal },
      { model: EmployeeWork },
      { model: EmployeeEmergency },
      { model: EmployeeEducation },
    ],
  });
   if (!employee) {
    console.log("Employee not found");
    return null;
}
     return employee;
  }



  //  UPDATE EMPLOYEE
  public static async updateEmployee(id: string, data: any) {
  const employee = await Employee.findByPk(id);

  if (!employee) {
    throw new Error("Employee not found");
  }

  // 1. Update main employee table (only its fields)
  await employee.update({
    designation: data.designation,
    band: data.band,
    location: data.location,
  });

  // 2. Contact
  if (data.contact) {
    await EmployeeContact.upsert({
      ...data.contact,
      employeeId: id,
    });
  }

  // 3. Personal
  if (data.personal) {
    await EmployeePersonal.upsert({
      ...data.personal,
      employeeId: id,
    });
  }

  // 4. Work
  if (data.work) {
    await EmployeeWork.upsert({
      ...data.work,
      employeeId: id,
    });
  }

  // 5. Emergency
  if (data.emergency) {
    await EmployeeEmergency.upsert({
      ...data.emergency,
      employeeId: id,
    });
  }

  // 6. Education (array)
  if (data.education?.length) {
    // delete old
    await EmployeeEducation.destroy({
      where: { employeeId: id },
    });

    // insert new
    const educationData = data.education.map((edu: any) => ({
      ...edu,
      employeeId: id,
    }));

    await EmployeeEducation.bulkCreate(educationData);
  }

  return { message: "Employee updated successfully" };
}



  //  DELETE EMPLOYEE
  public static async deleteEmployee(id: string) {
    const employee = await Employee.findByPk(id);

    if (!employee) {
      throw new Error("Employee not found");
    }

    await employee.destroy();
  }
}