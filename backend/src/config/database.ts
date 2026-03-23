import { Sequelize } from "sequelize";
import CandidateModel from "../../models/candidate";
import JobApplicationModel from "../../models/jobApplication";
import JobCriteriaModel from "../../models/jobCriteria";
import JobModel from "../../models/job";
import UserModel from "../../models/user";
import InterviewSlotModel from "../../models/interviewSlot";
import InterviewModel from "../../models/interview";
import ScorecardModel from "../../models/scorecard";
import PipelineEventModel from "../../models/pipelineEvent";
import { runtimeConfig } from "./runtime";

const isProduction = runtimeConfig.nodeEnv.toLowerCase() === "production";

export const sequelize = new Sequelize(
  runtimeConfig.dbName,
  runtimeConfig.dbUser,
  runtimeConfig.dbPassword,
  {
    host: runtimeConfig.dbHost,
    port: runtimeConfig.dbPort,
    dialect: "mysql",
    logging: runtimeConfig.dbLogging ? console.log : false,
    dialectOptions: isProduction && runtimeConfig.dbSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : undefined,
  }
);

export const Candidate = CandidateModel(sequelize);
export const Job = JobModel(sequelize);
export const JobCriteria = JobCriteriaModel(sequelize);
export const JobApplication = JobApplicationModel(sequelize);
export const User = UserModel(sequelize);
export const InterviewSlot = InterviewSlotModel(sequelize);
export const Interview = InterviewModel(sequelize);
export const Scorecard = ScorecardModel(sequelize);
export const PipelineEvent = PipelineEventModel(sequelize);

// 1. Define the models object FIRST
const models = {
  candidate: Candidate,
  job: Job,
  jobCriteria: JobCriteria,
  jobApplication: JobApplication,
  user: User,
  interviewSlot: InterviewSlot,
  interview: Interview,
  scorecard: Scorecard,
  pipelineEvent: PipelineEvent,
};

// 2. Pass the ENTIRE `models` object to every associate function
if (Candidate.associate) Candidate.associate(models);
if (Job.associate) Job.associate(models);
if (JobCriteria.associate) JobCriteria.associate(models);
if (JobApplication.associate) JobApplication.associate(models);
if (User.associate) User.associate(models);
if (InterviewSlot.associate) InterviewSlot.associate(models);
if (Interview.associate) Interview.associate(models);
if (Scorecard.associate) Scorecard.associate(models);
if (PipelineEvent.associate) PipelineEvent.associate(models);

export const getTransaction = () => sequelize.transaction();

export type MainDbModelName = keyof typeof models;

export function getMainDbModel<T extends MainDbModelName>(modelName: T) {
  return models[modelName];
}