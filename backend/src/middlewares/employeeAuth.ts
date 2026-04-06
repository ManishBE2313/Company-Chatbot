import jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
import { runtimeConfig } from "../config/runtime";

export function employeeAuth(req: any, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.[runtimeConfig.authCookieName];

    if (!token && typeof req.headers.authorization === "string") {
      token = req.headers.authorization;
    }

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const verifyOptions: jwt.VerifyOptions = {};
    if (runtimeConfig.jwtIssuer) {
      verifyOptions.issuer = runtimeConfig.jwtIssuer;
    }
    if (runtimeConfig.jwtAudience) {
      verifyOptions.audience = runtimeConfig.jwtAudience;
    }

    const decoded = jwt.verify(token, runtimeConfig.jwtSecret, verifyOptions) as jwt.JwtPayload & {
      email?: string;
      sub?: string;
    };

    req.user = {
      ...decoded,
      email: typeof decoded.email === "string" ? decoded.email : decoded.sub,
    };

    next();
  } catch (error: any) {
    return res.status(401).json({
      message: "Invalid token",
      error: error.message,
    });
  }
}
