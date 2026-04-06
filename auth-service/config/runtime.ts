import { loadEnv } from "./env";

loadEnv();

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim().toLowerCase() === "true";
};

const toCsv = (value: string | undefined) =>
  (value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const toScopes = (value: string | undefined) =>
  (value || "openid,profile,email,offline_access")
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);

export const runtimeConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 8000),
  dbHost: process.env.DB_HOST || "127.0.0.1",
  dbPort: toNumber(process.env.DB_PORT, 3306),
  dbName: process.env.DB_NAME || "auth_service_db",
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "",
  dbLogging: toBoolean(process.env.DB_LOGGING, false),
  dbSsl: toBoolean(process.env.DB_SSL, false),
  dbAutoSync: toBoolean(process.env.DB_AUTO_SYNC, true),
  redisHost: process.env.REDIS_HOST || "127.0.0.1",
  redisPort: toNumber(process.env.REDIS_PORT, 6379),
  redisPassword: process.env.REDIS_PASSWORD || undefined,
  redisDb: toNumber(process.env.REDIS_DB, 0),
  authRequestQueueName: process.env.AUTH_REQUEST_QUEUE_NAME || "central-auth-login",
  authRequestTtlMs: toNumber(process.env.AUTH_REQUEST_TTL_MS, 5 * 60 * 1000),
  authQueueConcurrency: toNumber(process.env.AUTH_QUEUE_CONCURRENCY, 10),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3001",
  authServiceBaseUrl: process.env.AUTH_SERVICE_BASE_URL || `http://localhost:${toNumber(process.env.PORT, 8000)}`,
  allowedAppOrigins: toCsv(process.env.ALLOWED_APP_ORIGINS),
  authSyncSecret: process.env.AUTH_SYNC_SECRET || "",
  msTenantId: process.env.MS_TENANT_ID || "",
  msClientId: process.env.MS_CLIENT_ID || "",
  msClientSecret: process.env.MS_CLIENT_SECRET || "",
  msRedirectUri: process.env.MS_REDIRECT_URI || `http://localhost:${toNumber(process.env.PORT, 8000)}/api/auth/callback`,
  msScopes: toScopes(process.env.MS_SCOPES),
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  jwtIssuer: process.env.JWT_ISSUER || "company-chatbot-auth-service",
  jwtAudience: process.env.JWT_AUDIENCE || "company-chatbot-apps",
  refreshTokenExpiresInDays: toNumber(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS, 30),
  authCookieName: process.env.AUTH_COOKIE_NAME || "authcookie1",
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || "refreshcookie1",
  authCookieDomain: process.env.AUTH_COOKIE_DOMAIN || undefined,
  authCookieSecure: toBoolean(process.env.AUTH_COOKIE_SECURE, process.env.NODE_ENV === "production"),
  authCookieSameSite: (process.env.AUTH_COOKIE_SAMESITE || (process.env.NODE_ENV === "production" ? "none" : "lax")) as
    | "lax"
    | "strict"
    | "none",
  authCookieMaxAgeMs: toNumber(process.env.AUTH_COOKIE_MAX_AGE_MS, 60 * 60 * 1000),
  postLogoutRedirectUri: process.env.POST_LOGOUT_REDIRECT_URI || "http://localhost:3001/login",
};