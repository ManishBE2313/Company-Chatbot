
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
  public static async getEmployeeById(id: string) {
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



  //  UPDATE EMPLOYEE
  public static async updateEmployee(id: string, data: any) {
    const employee = await Employee.findByPk(id);

    if (!employee) {
      throw new Error("Employee not found");
    }

    await employee.update(data);

    return employee;
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