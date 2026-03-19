import { Sequelize } from "sequelize";
import CandidateModel from "../../models/candidate";
import JobApplicationModel from "../../models/jobApplication";
import JobCriteriaModel from "../../models/jobCriteria";
import JobModel from "../../models/job";
import UserModel from "../../models/user";
import { runtimeConfig } from "./runtime";

const isProduction = runtimeConfig.nodeEnv.toLowerCase() === "production";

export const sequelize = new Sequelize(
  runtimeConfig.dbName,
  runtimeConfig.dbUser,
  runtimeConfig.dbPassword,
  {
    host: runtimeConfig.dbHost,
    port: runtimeConfig.dbPort,
    dialect: "postgres",
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

if (Candidate.associate) Candidate.associate({ jobApplication: JobApplication });
if (Job.associate) Job.associate({ jobCriteria: JobCriteria, jobApplication: JobApplication });
if (JobCriteria.associate) JobCriteria.associate({ job: Job });
if (JobApplication.associate) JobApplication.associate({ candidate: Candidate, job: Job });

export const getTransaction = () => sequelize.transaction();

const models = {
  candidate: Candidate,
  job: Job,
  jobCriteria: JobCriteria,
  jobApplication: JobApplication,
  user: User,
};

export type MainDbModelName = keyof typeof models;

export function getMainDbModel<T extends MainDbModelName>(modelName: T) {
  return models[modelName];
}
