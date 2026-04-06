import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import authRouter from "./routes/auth";
import { runtimeConfig } from "./config/runtime";

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const allowOrigin = runtimeConfig.allowedAppOrigins.includes(origin) ? origin : runtimeConfig.frontendUrl;

  res.header("Access-Control-Allow-Origin", allowOrigin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-auth-sync-secret");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);

app.use((req: Request, _res: Response, next: NextFunction) => {
  next({
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error?.statusCode || 500;
  res.status(statusCode).json({
    message: error?.message || "Internal server error",
  });
});

export default app;