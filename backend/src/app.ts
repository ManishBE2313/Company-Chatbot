import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import authRouter from "./routes/auth";
import candidateRouter from "./routes/candidate";
import hrApplicationRouter from "./routes/hr/application";
import hrJobRouter from "./routes/hr/job";
import hrCatalogRouter from "./routes/hr/catalog";
import hrSettingsRouter from "./routes/hr/settings";
import userRouter from "./routes/hr/user";
import webhookRouter from "./routes/webhook";
import jobRouter from "./routes/job";
import Errors from "./errors";
import scorecardRouter from "./routes/scorecard";
import notificationRouter from "./routes/notification";
import interviewSlotRouter from "./routes/interviewSlot";
import interviewRouter from "./routes/interview";
import EmployeeRouter from "./routes/employee";

import cors from "cors";
import batchIngestRouter from "./routes/hr/batchIngest";
import dotenv from "dotenv";
import traceabilityRoutes from "./routes/traceability";
import { models } from "./config/database";
import { startSlotSyncCron } from "./cron/syncInterviewSlots";
import surveyRouter from "./routes/survey/create_survey";
import surveyUserResponseRouter from "./routes/survey/user_response";
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
)
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
startSlotSyncCron();
app.use(cookieParser());

app.use((req: any, _res, next) => {
  req.models = models;
  next();
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/candidates", candidateRouter);
app.use("/api/hr/applications", hrApplicationRouter);
app.use("/api/traceability", traceabilityRoutes);
app.use("/api/hr/jobs", hrJobRouter);
app.use("/api/hr/catalog", hrCatalogRouter);
app.use("/api/hr/settings", hrSettingsRouter);
app.use("/api/hr/user", userRouter);
app.use("/api/webhooks", webhookRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/scorecard", scorecardRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/slots", interviewSlotRouter);
app.use("/api/interviews", interviewRouter);
app.use("/api/employee", EmployeeRouter);
app.use("/api/hr/jobs/:jobId", batchIngestRouter);
app.use("/api/surveys", surveyUserResponseRouter);
app.use("/api/surveys", surveyRouter);
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new Errors.BadRequestError("Route not found: " + req.method + " " + req.originalUrl));
});

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error?.statusCode || 500;
  res.status(statusCode).json({
    message: error?.message || "Internal server error",
  });
});

export default app;
