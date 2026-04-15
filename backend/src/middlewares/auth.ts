import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, VerifyOptions } from "jsonwebtoken";
import Errors from "../errors";
import { runtimeConfig } from "../config/runtime";
import { UserRepository } from "../repositories/user";
import { UserRole } from "../../models/user";

interface AuthTokenPayload extends JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string | null;
  tenantId?: string;
  appCode?: string;
}

function getBearerToken(authorizationHeader?: string) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

function getRequestToken(req: Request & { cookies?: Record<string, string> }) {
  const cookieToken = req.cookies?.[runtimeConfig.authCookieName];
  if (cookieToken) {
    return cookieToken;
  }

  const authorizationHeader = typeof req.headers.authorization === "string"
    ? req.headers.authorization
    : undefined;

  return getBearerToken(authorizationHeader);
}

function normalizeRole(role?: string): UserRole {
  if (role === "admin" || role === "superadmin" || role === "interviewer") {
    return role;
  }

  return "user";
}

export async function auth(req: any, _res: Response, next: NextFunction) {
  try {
    if (!runtimeConfig.jwtSecret) {
      throw new Errors.SystemError("JWT_SECRET is not configured.");
    }

    const token = getRequestToken(req);
    if (!token) {
      throw new Errors.UnauthorizedError("Authentication token is required.");
    }

    const verifyOptions: VerifyOptions = {};
    if (runtimeConfig.jwtIssuer) {
      verifyOptions.issuer = runtimeConfig.jwtIssuer;
    }
    if (runtimeConfig.jwtAudience) {
      verifyOptions.audience = runtimeConfig.jwtAudience;
    }

    const decoded = jwt.verify(token, runtimeConfig.jwtSecret, verifyOptions) as AuthTokenPayload;
    const email = typeof decoded.email === "string" ? decoded.email.trim().toLowerCase() : "";

    if (!email) {
      throw new Errors.UnauthorizedError("Authentication token payload is invalid.");
    }

    const synced = await UserRepository.syncFromAuthClaims({
      email,
      firstName: typeof decoded.firstName === "string" ? decoded.firstName : null,
      lastName: typeof decoded.lastName === "string" ? decoded.lastName : null,
      role: normalizeRole(decoded.role),
      preserveExistingRole: true,
    });

    const user = synced.user;
    if (!user || user.isActive === false) {
      throw new Errors.UnauthorizedError("Authenticated user is inactive or unavailable in the core database.");
    }

    req.user = user;
    req.auth = decoded;

    if (!req.data) {
      req.data = {};
    }

    req.data.companyId = user.organizationId;
    next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.NotBeforeError
    ) {
      return next(new Errors.UnauthorizedError("Invalid or expired authentication token."));
    }

    next(error);
  }
}