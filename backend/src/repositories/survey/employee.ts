import { sequelize } from "../../config/database";
import EmployeeModel from "../../../models/employee";

const Employee = EmployeeModel(sequelize);

export class EmployeeRepository {

  static async findById(id: string) {
    return Employee.findByPk(id);
  }

}