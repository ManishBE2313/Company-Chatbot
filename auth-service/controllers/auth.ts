import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { authRequestQueue } from "../config/redis";
import { AuthRequest, AccessRole, Organization, RefreshToken, User, sequelize } from "../config/database";
import { runtimeConfig } from "../config/runtime";
import { AuthService } from "../services/auth";

function asSingleString(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return "";
}

function buildOrganizationName(email: string) {
  const domain = email.split("@")[1] || "organization";
  const label = domain.split(".")[0] || domain;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getEmailDomain(email: string) {
  return email.split("@")[1]?.toLowerCase() || null;
}

function getRefreshTokenFromRequest(req: Request & { cookies?: Record<string, string> }) {
  const cookieToken = req.cookies?.[runtimeConfig.refreshCookieName];
  if (cookieToken) {
    return cookieToken;
  }

  const bodyToken = asSingleString(req.body?.refreshToken);
  return bodyToken || null;
}

async function revokeRefreshToken(rawToken: string | null) {
  if (!rawToken) {
    return;
  }

  const tokenHash = AuthService.hashOpaqueToken(rawToken);
  const refreshToken = await RefreshToken.findOne({
    where: {
      tokenHash,
      revokedAt: null,
    },
  });

  if (!refreshToken) {
    return;
  }

  refreshToken.revokedAt = new Date();
  refreshToken.lastUsedAt = new Date();
  await refreshToken.save();
}

export class AuthController {
  public static async getRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = asSingleString(req.params.requestId);
      const authRequest = await AuthRequest.findByPk(requestId);

      if (authRequest) {
        if (authRequest.status !== "authenticated" && authRequest.expiresAt.getTime() <= Date.now()) {
          authRequest.status = "expired";
          authRequest.errorMessage = authRequest.errorMessage || "Authentication request expired.";
          await authRequest.save();
        }

        return res.status(200).json({
          data: {
            requestId: authRequest.id,
            appCode: authRequest.appCode,
            status: authRequest.status,
            authUrl: authRequest.status === "ready" ? authRequest.authUrl : null,
            errorMessage: authRequest.errorMessage,
            expiresAt: authRequest.expiresAt,
          },
        });
      }

      const queueJob = await authRequestQueue.getJob(requestId);
      if (queueJob) {
        return res.status(200).json({
          data: {
            requestId,
            status: "queued",
            authUrl: null,
            errorMessage: null,
            expiresAt: new Date(Date.now() + runtimeConfig.authRequestTtlMs),
          },
        });
      }

      return res.status(404).json({
        message: "Auth request not found.",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async callback(req: Request, res: Response, next: NextFunction) {
    const transaction = await sequelize.transaction();
    let committed = false;
    const state = asSingleString(req.query.state) || undefined;
    const decodedState = AuthService.decodeState(state);
    const authRequest = decodedState?.requestId ? await AuthRequest.findByPk(decodedState.requestId) : null;

    try {
      const code = asSingleString(req.query.code);

      if (!code || !decodedState?.requestId || !authRequest) {
        throw new Error("Missing or invalid auth request context.");
      }

      if (authRequest.expiresAt.getTime() <= Date.now()) {
        authRequest.status = "expired";
        authRequest.errorMessage = "Authentication request expired.";
        await authRequest.save({ transaction });
        throw new Error("Authentication request expired.");
      }

      const msalResult = await AuthService.acquireTokenByCode(code);
      const profile = AuthService.extractProfile(msalResult);
      const organizationDomain = getEmailDomain(profile.email);

      const [organization] = await Organization.findOrCreate({
        where: { tenantId: profile.tenantId },
        defaults: {
          name: buildOrganizationName(profile.email),
          tenantId: profile.tenantId,
          primaryDomain: organizationDomain,
          status: "active",
        },
        transaction,
      });

      if (!organization.primaryDomain && organizationDomain) {
        organization.primaryDomain = organizationDomain;
      }

      if (!organization.name) {
        organization.name = buildOrganizationName(profile.email);
      }

      if (organization.changed()) {
        await organization.save({ transaction });
      }

      await AccessRole.findOrCreate({
        where: {
          organizationId: organization.id,
          name: "user",
        },
        defaults: {
          organizationId: organization.id,
          name: "user",
          description: "Default central auth role",
          isSystem: true,
        },
        transaction,
      });

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            {
              tenantId: profile.tenantId,
              microsoftOid: profile.microsoftOid,
            },
            {
              email: profile.email,
            },
          ],
        },
        transaction,
      });

      const user = existingUser || User.build();
      user.organizationId = organization.id;
      user.firstName = profile.firstName;
      user.lastName = profile.lastName || null;
      user.email = profile.email;
      user.role = user.role || "user";
      user.status = "active";
      user.isActive = true;
      user.microsoftOid = profile.microsoftOid;
      user.tenantId = profile.tenantId;
      user.lastLoginAt = new Date();

      await user.save({ transaction });

      const syncedApplicationUser = await AuthService.syncUserToApplication(authRequest.syncUserUrl, {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName || null,
        role: user.role,
        tenantId: user.tenantId,
        appCode: authRequest.appCode,
      });

      const resolvedRole = syncedApplicationUser.role || user.role;
      const accessToken = AuthService.generateAccessToken({
        sub: user.id,
        email: user.email,
        role: resolvedRole,
        firstName: user.firstName,
        lastName: user.lastName || null,
        tenantId: user.tenantId,
        appCode: authRequest.appCode,
      });

      const refreshToken = AuthService.createRefreshToken();
      await RefreshToken.create(
        {
          userId: user.id,
          appCode: authRequest.appCode,
          familyId: refreshToken.familyId,
          tokenHash: refreshToken.tokenHash,
          expiresAt: refreshToken.expiresAt,
        },
        { transaction }
      );

      authRequest.status = "authenticated";
      authRequest.errorMessage = null;
      authRequest.completedAt = new Date();
      await authRequest.save({ transaction });

      await transaction.commit();
      committed = true;

      res.cookie(runtimeConfig.authCookieName, accessToken, AuthService.getAccessCookieOptions());
      res.cookie(runtimeConfig.refreshCookieName, refreshToken.rawToken, AuthService.getRefreshCookieOptions());

      return res.redirect(302, AuthService.resolveSuccessRedirect(authRequest));
    } catch (error) {
      if (!committed) {
        await transaction.rollback();
      }

      if (authRequest) {
        authRequest.status = authRequest.status === "expired" ? "expired" : "failed";
        authRequest.errorMessage = error instanceof Error ? error.message : "Authentication failed.";
        await authRequest.save().catch(() => undefined);
        return res.redirect(302, AuthService.resolveFailureRedirect(authRequest, authRequest.errorMessage));
      }

      next(error);
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const rawRefreshToken = getRefreshTokenFromRequest(req as Request & { cookies?: Record<string, string> });
      if (!rawRefreshToken) {
        return res.status(401).json({ message: "Refresh token is required." });
      }

      const tokenHash = AuthService.hashOpaqueToken(rawRefreshToken);
      const storedToken = await RefreshToken.findOne({
        where: {
          tokenHash,
          revokedAt: null,
        },
        include: [{ model: User, as: "user" }],
      }) as any;

      if (!storedToken || !storedToken.user || storedToken.expiresAt.getTime() <= Date.now()) {
        return res.status(401).json({ message: "Refresh token is invalid or expired." });
      }

      storedToken.revokedAt = new Date();
      storedToken.lastUsedAt = new Date();
      await storedToken.save();

      const rotatedToken = AuthService.rotateRefreshToken();
      await RefreshToken.create({
        userId: storedToken.user.id,
        appCode: storedToken.appCode,
        familyId: storedToken.familyId,
        tokenHash: rotatedToken.tokenHash,
        expiresAt: rotatedToken.expiresAt,
      });

      const accessToken = AuthService.generateAccessToken({
        sub: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
        firstName: storedToken.user.firstName,
        lastName: storedToken.user.lastName || null,
        tenantId: storedToken.user.tenantId,
        appCode: storedToken.appCode,
      });

      res.cookie(runtimeConfig.authCookieName, accessToken, AuthService.getAccessCookieOptions());
      res.cookie(runtimeConfig.refreshCookieName, rotatedToken.rawToken, AuthService.getRefreshCookieOptions());

      return res.status(200).json({
        data: {
          accessToken,
          expiresIn: runtimeConfig.authCookieMaxAgeMs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const rawRefreshToken = getRefreshTokenFromRequest(req as Request & { cookies?: Record<string, string> });
      await revokeRefreshToken(rawRefreshToken);

      res.clearCookie(runtimeConfig.authCookieName, AuthService.getAccessCookieOptions());
      res.clearCookie(runtimeConfig.refreshCookieName, AuthService.getRefreshCookieOptions());

      if (req.method === "GET") {
        const returnTo = asSingleString(req.query.returnTo) || runtimeConfig.postLogoutRedirectUri;
        return res.redirect(302, AuthService.getLogoutUrl(returnTo));
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}