
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
  private static sanitizeSection(data: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(data).filter(([key]) => key !== "id" && key !== "employeeId" && key !== "createdAt" && key !== "updatedAt")
    );
  }

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
  const employee = await Employee.findOne({
    where: { workEmail: email },
  });
   if (!employee) {
    console.log("Employee not found");
    return null;
}

  const employeeId = employee.id;
  const [employeeContact, employeePersonal, employeeWork, employeeEmergency, employeeEducations] =
    await Promise.all([
      EmployeeContact.findOne({ where: { employeeId }, order: [["updatedAt", "DESC"]] }),
      EmployeePersonal.findOne({ where: { employeeId }, order: [["updatedAt", "DESC"]] }),
      EmployeeWork.findOne({ where: { employeeId }, order: [["updatedAt", "DESC"]] }),
      EmployeeEmergency.findOne({ where: { employeeId }, order: [["updatedAt", "DESC"]] }),
      EmployeeEducation.findAll({ where: { employeeId }, order: [["updatedAt", "DESC"]] }),
    ]);

     return {
      ...employee.toJSON(),
      employeeContact,
      employeePersonal,
      employeeWork,
      employeeEmergency,
      employeeEducations,
     };
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

  const updateOrCreateRelated = async (model: any, values: Record<string, unknown>, label: string) => {
    const sanitizedValues = EmployeeService.sanitizeSection(values);
    const existingRows = await model.findAll({
      where: { employeeId: id },
      order: [["updatedAt", "DESC"]],
    });
    const [existing, ...duplicates] = existingRows;

    console.log(`updating ${label}`, {
      employeeId: id,
      sanitizedValues,
      foundExisting: Boolean(existing),
      duplicateCount: duplicates.length,
    });

    if (duplicates.length) {
      await model.destroy({
        where: {
          id: duplicates.map((row: any) => row.id),
        },
      });
    }

    if (existing) {
      await existing.update(sanitizedValues);
      console.log(`${label} updated`);
      return existing;
    }

    const created = await model.create({
      ...sanitizedValues,
      employeeId: id,
    });
    console.log(`${label} created`);
    return created;
  };

  // 2. Contact
  if (data.contact) {
    await updateOrCreateRelated(EmployeeContact, data.contact, "contact");
  }

  // 3. Personal
  if (data.personal) {
    await updateOrCreateRelated(EmployeePersonal, data.personal, "personal");
  }

  // 4. Work
  if (data.work) {
    await updateOrCreateRelated(EmployeeWork, data.work, "work");
  }

  // 5. Emergency
  if (data.emergency) {
    await updateOrCreateRelated(EmployeeEmergency, data.emergency, "emergency");
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
