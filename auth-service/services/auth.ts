import {
  AuthenticationResult,
  AuthorizationUrlRequest,
  ConfidentialClientApplication,
} from "@azure/msal-node";
import axios from "axios";
import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { runtimeConfig } from "../config/runtime";
import { AuthRequestAttributes } from "../models/authRequest";

export interface DecodedAuthState {
  requestId: string;
}

export interface AuthenticatedProfile {
  email: string;
  firstName: string;
  lastName?: string | null;
  displayName: string;
  tenantId: string;
  microsoftOid: string;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  firstName: string;
  lastName?: string | null;
  tenantId: string;
  appCode: string;
}

export interface AppSyncPayload {
  email: string;
  firstName: string;
  lastName?: string | null;
  role: string;
  tenantId: string;
  appCode: string;
}

const msalClient = new ConfidentialClientApplication({
  auth: {
    clientId: runtimeConfig.msClientId,
    authority: `https://login.microsoftonline.com/${runtimeConfig.msTenantId}`,
    clientSecret: runtimeConfig.msClientSecret,
  },
});

function ensureAuthConfig() {
  const missingKeys = [
    ["MS_TENANT_ID", runtimeConfig.msTenantId],
    ["MS_CLIENT_ID", runtimeConfig.msClientId],
    ["MS_CLIENT_SECRET", runtimeConfig.msClientSecret],
    ["JWT_SECRET", runtimeConfig.jwtSecret],
  ].filter(([, value]) => !value);

  if (missingKeys.length > 0) {
    throw new Error(`Missing required auth configuration: ${missingKeys.map(([key]) => key).join(", ")}`);
  }
}

function pickFirstString(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getAllowedOrigins() {
  if (runtimeConfig.allowedAppOrigins.length > 0) {
    return runtimeConfig.allowedAppOrigins;
  }

  return [runtimeConfig.frontendUrl, "http://localhost:3000", "http://localhost:3001", "http://localhost:5173"];
}

export class AuthService {
  public static async getAuthCodeUrl(requestId: string) {
    ensureAuthConfig();

    const authCodeUrlRequest: AuthorizationUrlRequest = {
      scopes: runtimeConfig.msScopes,
      redirectUri: runtimeConfig.msRedirectUri,
      state: Buffer.from(JSON.stringify({ requestId } satisfies DecodedAuthState)).toString("base64url"),
      prompt: "select_account",
    };

    return msalClient.getAuthCodeUrl(authCodeUrlRequest);
  }

  public static async acquireTokenByCode(code: string): Promise<AuthenticationResult> {
    ensureAuthConfig();

    const result = await msalClient.acquireTokenByCode({
      code,
      scopes: runtimeConfig.msScopes,
      redirectUri: runtimeConfig.msRedirectUri,
    });

    if (!result) {
      throw new Error("Microsoft Entra did not return a token response for the authorization code.");
    }

    return result;
  }

  public static decodeState(state?: string): DecodedAuthState | null {
    if (!state) {
      return null;
    }

    try {
      return JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as DecodedAuthState;
    } catch {
      return null;
    }
  }

  public static extractProfile(result: AuthenticationResult): AuthenticatedProfile {
    const claims = (result.idTokenClaims || {}) as Record<string, unknown>;
    const email = pickFirstString(
      claims.preferred_username,
      claims.email,
      claims.upn,
      result.account?.username
    ).toLowerCase();

    const firstName = pickFirstString(claims.given_name, claims.name, email.split("@")[0] || "User");
    const lastName = pickFirstString(claims.family_name) || null;
    const displayName = pickFirstString(claims.name, `${firstName}${lastName ? ` ${lastName}` : ""}`.trim(), email);
    const tenantId = pickFirstString(claims.tid, result.tenantId);
    const microsoftOid = pickFirstString(claims.oid, result.account?.localAccountId);

    if (!email || !tenantId || !microsoftOid) {
      throw new Error("Microsoft Entra response is missing one or more required user claims.");
    }

    return {
      email,
      firstName,
      lastName,
      displayName,
      tenantId,
      microsoftOid,
    };
  }

  public static async syncUserToApplication(syncUserUrl: string | null | undefined, payload: AppSyncPayload) {
    if (!syncUserUrl) {
      return {
        role: payload.role,
        roles: [],
      };
    }

    let response;

    try {
      response = await axios.post(
        syncUserUrl,
        payload,
        {
          timeout: 10000,
          headers: {
            "x-auth-sync-secret": runtimeConfig.authSyncSecret,
          },
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseMessage =
          typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : typeof error.response?.data?.error === "string"
              ? error.response.data.error
              : null;

        throw new Error(
          responseMessage
            ? `Application sync failed: ${responseMessage}`
            : `Application sync failed with status ${error.response?.status || "unknown"}.`
        );
      }

      throw error;
    }

    return {
      role: response.data?.data?.role || payload.role,
      roles: Array.isArray(response.data?.data?.roles) ? response.data.data.roles : [],
      localUserId: response.data?.data?.id,
    };
  }

  public static generateAccessToken(payload: AccessTokenPayload) {
    ensureAuthConfig();

    const signOptions: SignOptions = {
      subject: payload.sub,
      expiresIn: runtimeConfig.jwtExpiresIn as SignOptions["expiresIn"],
      issuer: runtimeConfig.jwtIssuer,
      audience: runtimeConfig.jwtAudience,
    };

    return jwt.sign(
      {
        email: payload.email,
        role: payload.role,
        firstName: payload.firstName,
        lastName: payload.lastName || null,
        tenantId: payload.tenantId,
        appCode: payload.appCode,
      },
      runtimeConfig.jwtSecret,
      signOptions
    );
  }

  public static createRefreshToken() {
    const rawToken = crypto.randomBytes(48).toString("hex");
    const familyId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + runtimeConfig.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000);

    return {
      rawToken,
      familyId,
      expiresAt,
      tokenHash: this.hashOpaqueToken(rawToken),
    };
  }

  public static rotateRefreshToken() {
    const rawToken = crypto.randomBytes(48).toString("hex");
    return {
      rawToken,
      tokenHash: this.hashOpaqueToken(rawToken),
      expiresAt: new Date(Date.now() + runtimeConfig.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000),
    };
  }

  public static hashOpaqueToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  public static getAccessCookieOptions() {
    return {
      httpOnly: true,
      secure: runtimeConfig.authCookieSecure,
      sameSite: runtimeConfig.authCookieSameSite,
      domain: runtimeConfig.authCookieDomain,
      maxAge: runtimeConfig.authCookieMaxAgeMs,
      path: "/",
    } as const;
  }

  public static getRefreshCookieOptions() {
    return {
      httpOnly: true,
      secure: runtimeConfig.authCookieSecure,
      sameSite: runtimeConfig.authCookieSameSite,
      domain: runtimeConfig.authCookieDomain,
      maxAge: runtimeConfig.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
      path: "/",
    } as const;
  }

  public static getLogoutUrl(postLogoutRedirectUri?: string) {
    const redirectUri = encodeURIComponent(postLogoutRedirectUri || runtimeConfig.postLogoutRedirectUri);
    return `https://login.microsoftonline.com/${runtimeConfig.msTenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${redirectUri}`;
  }

  public static assertAllowedRedirectUrl(url: string, label: string) {
    let parsed: URL;

    try {
      parsed = new URL(url);
    } catch {
      throw new Error(`${label} is not a valid absolute URL.`);
    }

    const allowedOrigins = getAllowedOrigins().map((origin) => new URL(origin).origin);
    if (!allowedOrigins.includes(parsed.origin)) {
      throw new Error(`${label} origin ${parsed.origin} is not allowed.`);
    }

    return parsed.toString();
  }

  public static resolveSuccessRedirect(authRequest: Pick<AuthRequestAttributes, "successRedirectUrl" | "returnTo">) {
    const baseRedirect = new URL(authRequest.successRedirectUrl);

    if (authRequest.returnTo) {
      try {
        const resolved = new URL(authRequest.returnTo, authRequest.successRedirectUrl);
        if (resolved.origin === baseRedirect.origin) {
          return resolved.toString();
        }
      } catch {
      }
    }

    return baseRedirect.toString();
  }

  public static resolveFailureRedirect(authRequest: Pick<AuthRequestAttributes, "failureRedirectUrl" | "successRedirectUrl"> | null, message: string) {
    const fallback = authRequest?.failureRedirectUrl || authRequest?.successRedirectUrl || runtimeConfig.frontendUrl;
    const redirectUrl = new URL(fallback);
    redirectUrl.searchParams.set("authError", message);
    return redirectUrl.toString();
  }
}
