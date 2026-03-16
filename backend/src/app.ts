import express, { NextFunction, Request, Response } from "express";
import candidateRouter from "./routes/candidate";
import webhookRouter from "./routes/webhook";
import Errors from "./errors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/candidates", candidateRouter);
app.use("/api/webhooks", webhookRouter);

app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new Errors.BadRequestError(`Route not found: ${req.method} ${req.originalUrl}`));
});

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error?.statusCode || 500;
  res.status(statusCode).json({
    message: error?.message || "Internal server error",
  });
});

export default app;
