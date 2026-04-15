"use strict";
import { Model, DataTypes, Sequelize, ModelStatic } from "sequelize";
import { DEFAULT_ORGANIZATION_ID } from "../src/constants/system";

export interface SkillAttributes {
  id: string;
  organizationId: string;
  name: string;
  category: string;
  isActive?: boolean;
}

export interface SkillInstance extends Model<SkillAttributes>, SkillAttributes {}

export default function SkillModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<SkillInstance> & {
  associate?: (models: any) => void;
} {
  const Skill = sequelize.define<SkillInstance>(
    "skill",
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
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        field: "is_active",
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "skills",
      modelName: "skill",
      schema,
      timestamps: true,
      indexes: [{ unique: true, fields: ["organization_id", "name"] }],
    }
  ) as ModelStatic<SkillInstance> & {
    associate?: (models: any) => void;
  };

  Skill.associate = (models: any) => {
    Skill.belongsTo(models.organization, { foreignKey: "organizationId", as: "organization" });
    Skill.hasMany(models.jobRoleSkill, { foreignKey: "skillId", as: "jobRoleSkills" });
  };

  return Skill;
}
