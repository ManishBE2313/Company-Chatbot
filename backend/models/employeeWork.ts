import { DataTypes, Sequelize } from "sequelize";


export default function EmployeeWorkModel(sequelize: Sequelize) {
  return sequelize.define("employeeWork", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: DataTypes.UUID,
    reportingManager: DataTypes.STRING || null,
    dateOfJoining: DataTypes.DATE || null,
    annualCompensation: DataTypes.FLOAT || null,
  });
}