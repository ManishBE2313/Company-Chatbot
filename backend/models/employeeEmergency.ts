import { DataTypes, Sequelize } from "sequelize";

export default function EmployeeEmergencyModel(sequelize: Sequelize) {
  return sequelize.define("employeeEmergency", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: DataTypes.UUID,
    name: DataTypes.STRING,
    relation: DataTypes.STRING,
    phone: DataTypes.STRING,
  });
}