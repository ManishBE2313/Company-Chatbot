import { DataTypes, Sequelize } from "sequelize";

export default function EmployeePersonalModel(sequelize: Sequelize) {
  return sequelize.define("employeePersonal", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: DataTypes.UUID,
    nationality: DataTypes.STRING,
    dob: DataTypes.DATE,
    bloodGroup: DataTypes.STRING,
    maritalStatus: DataTypes.STRING,
    aadhar: DataTypes.STRING,
    pan: DataTypes.STRING,
    uan: DataTypes.STRING,
    passport: DataTypes.STRING,
  });
}