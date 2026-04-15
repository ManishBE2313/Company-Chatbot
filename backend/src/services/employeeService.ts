import { EmployeeRepository } from "../repositories/employeeRepository";
import Errors from "../errors";
import {
  User,
  EmployeeContact,
  EmployeePersonal,
  EmployeeWork,
  EmployeeEmergency,
  EmployeeEducation,
  sequelize,
} from "../config/database";

export class EmployeeService {
  private static sanitizeSection(data: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(data).filter(([key]) => key !== "id" && key !== "employeeId" && key !== "createdAt" && key !== "updatedAt")
    );
  }

  public static async createEmployee(data: any) {
    const transaction = await sequelize.transaction();

    try {
      const normalizedEmail = String(data.email || data.workEmail || "").trim().toLowerCase();
      if (!data.firstName?.trim()) {
        throw new Errors.BadRequestError("First name is required.");
      }

      if (!data.lastName?.trim()) {
        throw new Errors.BadRequestError("Last name is required.");
      }

      if (!normalizedEmail) {
        throw new Errors.BadRequestError("Work email is required.");
      }

      const existingEmployee = await EmployeeRepository.findByWorkEmail(normalizedEmail);
      if (existingEmployee) {
        throw new Errors.BadRequestError("An employee with this work email already exists.");
      }

      const employee = await EmployeeRepository.createEmployee(data, transaction);
      const employeeId = employee.id;

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

  public static async getAllEmployees() {
    return User.findAll({
      attributes: ["id", "firstName", "lastName", "email", "workEmail", "designation", "band", "location", "profileCompleted"],
      order: [["createdAt", "DESC"]],
    });
  }

  public static async getEmployeeByEmail(email: string) {
    const employee = await EmployeeRepository.findByWorkEmail(email);
    if (!employee) {
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

  public static async updateEmployee(id: string, data: any) {
  const employee = await User.findByPk(id);

    if (!employee) {
      throw new Error("Employee not found");
    }

    await employee.update({
      firstName: data.firstName ?? employee.firstName,
      lastName: data.lastName ?? employee.lastName,
      email: data.email ?? data.workEmail ?? employee.email,
      workEmail: data.workEmail ?? data.email ?? employee.workEmail,
      designation: data.designation ?? employee.designation,
      band: data.band ?? employee.band,
      location: data.location ?? employee.location,
      profileCompleted: data.profileCompleted ?? employee.profileCompleted,
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

    if (data.contact) {
      await updateOrCreateRelated(EmployeeContact, data.contact, "contact");
    }

    if (data.personal) {
      await updateOrCreateRelated(EmployeePersonal, data.personal, "personal");
    }

    if (data.work) {
      await updateOrCreateRelated(EmployeeWork, data.work, "work");
    }

    if (data.emergency) {
      await updateOrCreateRelated(EmployeeEmergency, data.emergency, "emergency");
    }

    if (data.education?.length) {
      await EmployeeEducation.destroy({
        where: { employeeId: id },
      });

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
    const employee = await User.findByPk(id);

    if (!employee) {
      throw new Error("Employee not found");
    }

    await employee.destroy();
  }
}
