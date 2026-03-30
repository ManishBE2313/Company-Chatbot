import { DataTypes, Sequelize } from "sequelize";

export default function EmployeePersonalModel(sequelize: Sequelize) {
  return sequelize.define("employeePersonal", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: DataTypes.UUID,
    nationality: DataTypes.STRING || null,
    dob: DataTypes.DATE || null,
    bloodGroup: DataTypes.STRING || null,
    maritalStatus: DataTypes.STRING || null,
    aadhar: DataTypes.STRING || null,
    pan: DataTypes.STRING || null,
    uan: DataTypes.STRING || null,
    passport: DataTypes.STRING || null,
  });
}