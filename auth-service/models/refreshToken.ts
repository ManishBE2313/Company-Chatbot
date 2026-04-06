"use strict";
import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

export interface RefreshTokenAttributes {
  id: string;
  userId: string;
  appCode: string;
  familyId: string;
  tokenHash: string;
  expiresAt: Date;
  lastUsedAt?: Date | null;
  revokedAt?: Date | null;
}

export interface RefreshTokenInstance extends Model<RefreshTokenAttributes>, RefreshTokenAttributes {}

export default function RefreshTokenModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<RefreshTokenInstance> & {
  associate?: (models: any) => void;
} {
  const RefreshToken = sequelize.define<RefreshTokenInstance>(
    "refreshToken",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
        references: {
          model: "auth_users",
          key: "id",
        },
      },
      appCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "app_code",
      },
      familyId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "family_id",
      },
      tokenHash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "token_hash",
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "expires_at",
      },
      lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "last_used_at",
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "revoked_at",
      },
    },
    {
      tableName: "auth_refresh_tokens",
      modelName: "refreshToken",
      schema,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["token_hash"] },
        { fields: ["user_id", "app_code"] },
        { fields: ["expires_at"] },
      ],
    }
  ) as ModelStatic<RefreshTokenInstance> & {
    associate?: (models: any) => void;
  };

  RefreshToken.associate = (models: any) => {
    RefreshToken.belongsTo(models.user, { foreignKey: "userId", as: "user" });
  };

  return RefreshToken;
}