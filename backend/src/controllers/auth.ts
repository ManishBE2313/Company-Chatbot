import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth";
import { UserService } from "../services/user";

function asSingleString(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return "";
}

function normalizeRole(role: unknown) {
  return role === "admin" || role === "superadmin" || role === "interviewer"
    ? role
    : "user";
}

export class AuthController {
  public static async getCurrentUser(req: any, res: Response, next: NextFunction) {
    try {
      const auth = req.auth || {};
      const user = req.user || {};

      res.status(200).json({
        email: user.email || auth.email || auth.sub || null,
        role: user.role || auth.role || "user",
        is_sso: Boolean(auth.appCode || auth.tenantId || auth.email),
      });
    } catch (error) {
      next(error);
    }
  }

  public static async initiateSsoLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const returnTo = asSingleString(req.query.returnTo) || undefined;
      const requestedBy = asSingleString(req.headers["x-user-email"]) || null;
      const loginRequest = await AuthService.createQueuedLoginRequest({
        returnTo,
        requestedBy,
        requestedFromIp: req.ip,
        requestedUserAgent: asSingleString(req.headers["user-agent"]) || null,
      });

      res.status(200).type("html").send(AuthService.buildQueuedLoginHtml(loginRequest.statusUrl));
    } catch (error) {
      next(error);
    }
  }

  public static async createSsoRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const loginRequest = await AuthService.createQueuedLoginRequest({
        returnTo: asSingleString(req.body?.returnTo) || undefined,
        requestedBy: asSingleString(req.body?.requestedBy) || null,
        requestedFromIp: req.ip,
        requestedUserAgent: asSingleString(req.headers["user-agent"]) || null,
      });

      res.status(202).json({ data: loginRequest });
    } catch (error) {
      next(error);
    }
  }

  public static async getSsoRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = asSingleString(req.params.requestId);
      const status = await AuthService.getQueuedLoginRequestStatus(requestId);
      res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }

  public static async syncSsoUser(req: Request, res: Response, next: NextFunction) {
    try {
      const expectedSecret = process.env.AUTH_SYNC_SECRET || "";
      const providedSecret = asSingleString(req.headers["x-auth-sync-secret"]);

      if (!expectedSecret || providedSecret !== expectedSecret) {
        return res.status(401).json({ message: "Invalid auth sync secret." });
      }

      const result = await UserService.syncUserFromCentralAuth({
        email: asSingleString(req.body?.email),
        firstName: asSingleString(req.body?.firstName) || null,
        lastName: asSingleString(req.body?.lastName) || null,
        role: normalizeRole(req.body?.role),
      });

      res.status(200).json({
        data: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          roles: result.roles,
          created: result.created,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
