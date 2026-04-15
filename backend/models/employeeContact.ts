import { DataTypes, Sequelize } from "sequelize";

export default function EmployeeContactModel(sequelize: Sequelize) {
  return sequelize.define("employeeContact", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    personalEmail: DataTypes.STRING,
    phone: DataTypes.STRING,
    city: DataTypes.STRING,
    address: DataTypes.TEXT,
  });
}