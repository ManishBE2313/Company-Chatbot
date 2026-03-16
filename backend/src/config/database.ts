import { Sequelize } from "sequelize";
import CandidateModel from "../../models/candidate";
import JobCriteriaModel from "../../models/jobCriteria";
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
export const JobCriteria = JobCriteriaModel(sequelize);
export const User = UserModel(sequelize);

if (Candidate.associate) Candidate.associate({ jobCriteria: JobCriteria });
if (JobCriteria.associate) JobCriteria.associate({ candidate: Candidate });

export const getTransaction = () => sequelize.transaction();

const models = {
  candidate: Candidate,
  jobCriteria: JobCriteria,
  user: User,
};

export type MainDbModelName = keyof typeof models;

export function getMainDbModel<T extends MainDbModelName>(modelName: T) {
  return models[modelName];
}
