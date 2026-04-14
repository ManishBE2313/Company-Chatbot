"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";

export interface DepartmentAttributes {
  id: string;
  name: string;
}

export interface DepartmentInstance
  extends Model<DepartmentAttributes>,
    DepartmentAttributes {}

export default function DepartmentModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<DepartmentInstance> & { associate?: (models: any) => void } {
  const Department = sequelize.define<DepartmentInstance>(
    "department",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "departments",
      modelName: "department",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<DepartmentInstance> & { associate?: (models: any) => void };

  Department.associate = (models: any) => {
    Department.belongsToMany(models.survey, {
      through: models.survey_department,
      foreignKey: "departmentId",
      otherKey: "surveyId",
      as: "surveys",
    });
  };

  return Department;
}