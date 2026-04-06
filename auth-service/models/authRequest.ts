"use strict";
import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

export type AuthRequestStatus = "queued" | "ready" | "authenticated" | "failed" | "expired";

export interface AuthRequestAttributes {
  id: string;
  appCode: string;
  successRedirectUrl: string;
  failureRedirectUrl?: string | null;
  logoutRedirectUrl?: string | null;
  syncUserUrl?: string | null;
  returnTo?: string | null;
  requestedBy?: string | null;
  requestedFromIp?: string | null;
  requestedUserAgent?: string | null;
  status: AuthRequestStatus;
  authUrl?: string | null;
  errorMessage?: string | null;
  expiresAt: Date;
  completedAt?: Date | null;
}

export interface AuthRequestInstance extends Model<AuthRequestAttributes>, AuthRequestAttributes {}

export default function AuthRequestModel(
  sequelize: Sequelize,
  schema?: string
): ModelStatic<AuthRequestInstance> {
  return sequelize.define<AuthRequestInstance>(
    "authRequest",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      appCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "app_code",
      },
      successRedirectUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "success_redirect_url",
      },
      failureRedirectUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "failure_redirect_url",
      },
      logoutRedirectUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "logout_redirect_url",
      },
      syncUserUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "sync_user_url",
      },
      returnTo: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "return_to",
      },
      requestedBy: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "requested_by",
      },
      requestedFromIp: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "requested_from_ip",
      },
      requestedUserAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "requested_user_agent",
      },
      status: {
        type: DataTypes.ENUM("queued", "ready", "authenticated", "failed", "expired"),
        allowNull: false,
        defaultValue: "queued",
      },
      authUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "auth_url",
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "error_message",
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "expires_at",
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "completed_at",
      },
    },
    {
      tableName: "auth_login_requests",
      modelName: "authRequest",
      schema,
      timestamps: true,
      indexes: [
        { fields: ["app_code", "status"] },
        { fields: ["expires_at"] },
      ],
    }
  );
}