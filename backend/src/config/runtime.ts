import { loadEnv } from "./env";

loadEnv();

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const runtimeConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  backendPort: toNumber(process.env.BACKEND_PORT || process.env.PORT, 3000),
  frontendPort: toNumber(process.env.FRONTEND_PORT, 3001),
  fastApiPort: toNumber(process.env.FASTAPI_PORT, 8000),
  qdrantPort: toNumber(process.env.QDRANT_PORT, 6333),
  redisPort: toNumber(process.env.REDIS_PORT, 6379),
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: toNumber(process.env.DB_PORT, 3306),
  dbName:
    process.env.DB_NAME ||
    process.env.DB_NAME_DEV ||
    process.env.DB_NAME_TEST ||
    "main_db4",
  dbUser:
    process.env.DB_USER ||
    process.env.DB_USER_DEV ||
    process.env.POSTGRES_USER ||
    "root",
  dbPassword:
    process.env.DB_PASSWORD ||
    process.env.DB_COMPANY_PASSWORD_DEV ||
    process.env.POSTGRES_PASSWORD ||
    "",
  dbLogging: process.env.DB_LOGGING === "true",
  dbSsl: process.env.DB_SSL === "true",
  frontendUrl:
    process.env.FRONTEND_URL ||
    `http://localhost:${toNumber(process.env.FRONTEND_PORT, 3001)}`,
  fastApiBaseUrl:
    process.env.FASTAPI_BASE_URL ||
    `http://127.0.0.1:${toNumber(process.env.FASTAPI_PORT, 8000)}`,
  qdrantUrl:
    process.env.QDRANT_URL ||
    `http://localhost:${toNumber(process.env.QDRANT_PORT, 6333)}`,
};
