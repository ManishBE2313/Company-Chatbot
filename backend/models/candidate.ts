"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface CandidateAttributes {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  isReferral?: boolean;
  isInternal?: boolean;
}

export interface CandidateInstance extends Model<CandidateAttributes>, CandidateAttributes {}

export default function CandidateModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<CandidateInstance> & {
  associate?: (models: any) => void;
} {
  const Candidate = sequelize.define<CandidateInstance>(
    "candidate",
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
      firstName: {
        type: DataTypes.STRING,
        field: "first_name",
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        field: "last_name",
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isReferral: {
        type: DataTypes.BOOLEAN,
        field: "is_referral",
        defaultValue: false,
      },
      isInternal: {
        type: DataTypes.BOOLEAN,
        field: "is_internal",
        defaultValue: false,
      },
    },
    {
      tableName: "candidates",
      modelName: "candidate",
      schema,
      timestamps: true,
    }
  ) as ModelStatic<CandidateInstance> & {
    associate?: (models: any) => void;
  };

  Candidate.associate = (models: any) => {
    Candidate.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    Candidate.hasMany(models.jobApplication, {
      foreignKey: "candidateId",
      as: "applications",
    });
  };

  return Candidate;
}
