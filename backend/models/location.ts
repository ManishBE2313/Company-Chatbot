"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface LocationAttributes {
  id: string;
  organizationId: string;
  name: string;
  country: string;
  city: string;
}

export interface LocationInstance extends Model<LocationAttributes>, LocationAttributes {}

export default function LocationModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<LocationInstance> & {
  associate?: (models: any) => void;
} {
  const Location = sequelize.define<LocationInstance>(
    "location",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      organizationId: {
        type: DataTypes.UUID,
        field: "organization_id",
        allowNull: false,
        defaultValue: DEFAULT_ORGANIZATION_ID,
        references: {
          model: "organizations",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "locations",
      modelName: "location",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<LocationInstance> & {
    associate?: (models: any) => void;
  };

  Location.associate = (models: any) => {
    Location.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    Location.hasMany(models.job, { foreignKey: "locationId", as: "jobs" });
  };

  return Location;
}
