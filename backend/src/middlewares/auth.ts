import { NextFunction, Response } from "express";

export function auth(req: any, _res: Response, next: NextFunction) {
  if (!req.data) {
    req.data = {};
  }

  if (!req.data.companyId && typeof req.headers["x-company-id"] === "string") {
    req.data.companyId = req.headers["x-company-id"];
  }

  next();
}
