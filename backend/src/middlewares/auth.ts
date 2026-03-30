import { NextFunction, Response } from "express";

export function auth(req: any, _res: Response, next: NextFunction) {
  console.log("hitauth")
  if (!req.data) {
    req.data = {};
  }
  console.log("hitauth2")
  if (!req.data.companyId && typeof req.headers["x-company-id"] === "string") {
    req.data.companyId = req.headers["x-company-id"];
  }
console.log("hitauth3")
  next();
}
