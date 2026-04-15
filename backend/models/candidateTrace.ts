"use strict";
import { DataTypes, Sequelize } from "sequelize";

export default function CandidateTraceModel(sequelize: Sequelize) {
  return sequelize.define(
    "candidateTrace",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      jobId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "job_id",
      },

      applicationId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "application_id",
      },

      interviewId: {
        type: DataTypes.UUID,
        allowNull: true, // ✅ important
        field: "interview_id",
      },

      candidateId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "candidate_id",
      },

      candidateName: {
        type: DataTypes.STRING,
        field: "candidate_name",
      },

      currentStage: {
        type: DataTypes.STRING,
        field: "current_stage",
      },

      interviewerId: {
        type: DataTypes.UUID,
        field: "interviewer_id",
      },

      interviewerName: {
        type: DataTypes.STRING,
        field: "interviewer_name",
      },

      roundName: {
        type: DataTypes.STRING,
        field: "round_name",
      },

      technicalScore: DataTypes.INTEGER,
      communicationScore: DataTypes.INTEGER,
      recommendation: DataTypes.STRING,

      status: DataTypes.STRING,

      lastUpdatedAt: {
        type: DataTypes.DATE,
        field: "last_updated_at",
      },
    },
    {
      tableName: "candidate_trace",
      timestamps: false,
    }
  );
}