"use strict";
import { DataTypes, Sequelize } from "sequelize";

export default function JobTraceabilityModel(sequelize: Sequelize) {
  return sequelize.define(
    "jobTraceability",
    {
      jobId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        field: "job_id",
      },

      createdById: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "created_by_id",
      },

      createdByName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "created_by_name",
      },

      totalCandidates: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      selectedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      rejectedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      inProgressCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      lastUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "last_updated_at",
      },
    },
    {
      tableName: "job_traceability",
      timestamps: false,
    }
  );
}