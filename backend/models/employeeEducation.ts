import { DataTypes, Sequelize } from "sequelize";

export default function EmployeeEducationModel(sequelize: Sequelize) {
  return sequelize.define("employeeEducation", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
    },
    type: {
      type: DataTypes.STRING, // 10th, 12th, college
    },
    institute: DataTypes.STRING,
    year: DataTypes.STRING,
    percentage: DataTypes.STRING,
  });
}