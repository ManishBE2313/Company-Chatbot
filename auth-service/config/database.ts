import { Sequelize } from "sequelize";
import AccessRoleModel from "../models/accessRole";
import AuthRequestModel from "../models/authRequest";
import OrganizationModel from "../models/organization";
import RefreshTokenModel from "../models/refreshToken";
import UserModel from "../models/user";
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
    dialectOptions:
      isProduction && runtimeConfig.dbSsl
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : undefined,
  }
);

export const Organization = OrganizationModel(sequelize);
export const AccessRole = AccessRoleModel(sequelize);
export const User = UserModel(sequelize);
export const AuthRequest = AuthRequestModel(sequelize);
export const RefreshToken = RefreshTokenModel(sequelize);

const models = {
  organization: Organization,
  accessRole: AccessRole,
  user: User,
  authRequest: AuthRequest,
  refreshToken: RefreshToken,
};

for (const model of Object.values(models) as Array<any>) {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
}

export { models };