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
  fastApiPort: toNumber(process.env.FASTAPI_PORT, 8001),
  qdrantPort: toNumber(process.env.QDRANT_PORT, 6333),
  redisPort: toNumber(process.env.REDIS_PORT, 6379),
  redisHost: process.env.REDIS_HOST || "127.0.0.1",
  redisPassword: process.env.REDIS_PASSWORD || undefined,
  redisDb: toNumber(process.env.REDIS_DB, 0),
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
    `http://127.0.0.1:${toNumber(process.env.FASTAPI_PORT, 8001)}`,
  authServiceBaseUrl:
    process.env.AUTH_SERVICE_BASE_URL ||
    `http://127.0.0.1:${toNumber(process.env.AUTH_SERVICE_PORT, 8000)}`,
  authRequestQueueName: process.env.AUTH_REQUEST_QUEUE_NAME || "central-auth-login",
  authClientAppCode: process.env.AUTH_CLIENT_APP_CODE || "hr-portal",
  authSuccessRedirectUrl: process.env.AUTH_SUCCESS_REDIRECT_URL || process.env.FRONTEND_URL || `http://localhost:${toNumber(process.env.FRONTEND_PORT, 3001)}`,
  authFailureRedirectUrl: process.env.AUTH_FAILURE_REDIRECT_URL || `${process.env.FRONTEND_URL || `http://localhost:${toNumber(process.env.FRONTEND_PORT, 3001)}`}/login`,
  authLogoutRedirectUrl: process.env.AUTH_LOGOUT_REDIRECT_URL || `${process.env.FRONTEND_URL || `http://localhost:${toNumber(process.env.FRONTEND_PORT, 3001)}`}/login`,
  authSyncUserUrl: process.env.AUTH_SYNC_USER_URL || `${process.env.ROOT_URL || `http://localhost:${toNumber(process.env.BACKEND_PORT || process.env.PORT, 3000)}`}/api/auth/sso/sync`,
  authSyncSecret: process.env.AUTH_SYNC_SECRET || "",
  qdrantUrl:
    process.env.QDRANT_URL ||
    `http://localhost:${toNumber(process.env.QDRANT_PORT, 6333)}`,
  jwtSecret: process.env.JWT_SECRET || "",
  jwtIssuer: process.env.JWT_ISSUER || "company-chatbot-auth-service",
  jwtAudience: process.env.JWT_AUDIENCE || "company-chatbot-apps",
  authCookieName: process.env.AUTH_COOKIE_NAME || "authcookie1",
};