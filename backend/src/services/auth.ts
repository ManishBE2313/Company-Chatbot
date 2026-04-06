import { randomUUID } from "crypto";
import axios from "axios";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { runtimeConfig } from "../config/runtime";

interface QueuedLoginRequestOptions {
  returnTo?: string;
  requestedBy?: string | null;
  requestedFromIp?: string | null;
  requestedUserAgent?: string | null;
}

interface AuthRequestStatusResponse {
  data: {
    requestId: string;
    status: "queued" | "ready" | "authenticated" | "failed" | "expired";
    authUrl?: string | null;
    errorMessage?: string | null;
    expiresAt?: string;
  };
}

const redisConnection = new IORedis({
  host: runtimeConfig.redisHost,
  port: runtimeConfig.redisPort,
  password: runtimeConfig.redisPassword,
  db: runtimeConfig.redisDb,
  maxRetriesPerRequest: null,
});

const authRequestQueue = new Queue(runtimeConfig.authRequestQueueName, {
  connection: redisConnection,
});

export class AuthService {
  public static async createQueuedLoginRequest(options: QueuedLoginRequestOptions = {}) {
    const requestId = randomUUID();
    const payload = {
      requestId,
      appCode: runtimeConfig.authClientAppCode,
      successRedirectUrl: runtimeConfig.authSuccessRedirectUrl,
      failureRedirectUrl: runtimeConfig.authFailureRedirectUrl,
      logoutRedirectUrl: runtimeConfig.authLogoutRedirectUrl,
      syncUserUrl: runtimeConfig.authSyncUserUrl,
      returnTo: options.returnTo || null,
      requestedBy: options.requestedBy || null,
      requestedFromIp: options.requestedFromIp || null,
      requestedUserAgent: options.requestedUserAgent || null,
    };

    await authRequestQueue.add("create-auth-request", payload, {
      jobId: requestId,
      removeOnComplete: 500,
      removeOnFail: 500,
    });

    return {
      requestId,
      statusUrl: `/api/auth/sso/requests/${requestId}`,
    };
  }

  public static async getQueuedLoginRequestStatus(requestId: string) {
    const response = await axios.get<AuthRequestStatusResponse>(
      `${runtimeConfig.authServiceBaseUrl}/api/auth/requests/${requestId}`,
      {
        timeout: 10000,
      }
    );

    return response.data;
  }

  public static buildQueuedLoginHtml(statusUrl: string) {
    const safeStatusUrl = JSON.stringify(statusUrl);

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redirecting to Microsoft</title>
    <style>
      body { font-family: Segoe UI, Arial, sans-serif; background: #f8fafc; color: #0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; }
      .card { width:min(92vw, 420px); background:white; border:1px solid #e2e8f0; border-radius:20px; box-shadow:0 20px 45px rgba(15,23,42,.08); padding:32px; text-align:center; }
      .dot { width:14px; height:14px; border-radius:999px; margin:0 auto 18px; background:#2563eb; animation:pulse 1.2s infinite ease-in-out; }
      .muted { color:#475569; font-size:14px; line-height:1.5; }
      .error { color:#b91c1c; font-size:14px; margin-top:16px; }
      @keyframes pulse { 0%,100%{transform:scale(.9);opacity:.5;} 50%{transform:scale(1.15);opacity:1;} }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="dot"></div>
      <h1 style="margin:0 0 12px;font-size:22px;">Preparing secure sign-in</h1>
      <p class="muted" id="message">Central auth is preparing your Microsoft login request. This usually takes a moment.</p>
      <p class="error" id="error"></p>
    </div>
    <script>
      const statusUrl = ${safeStatusUrl};
      const messageEl = document.getElementById("message");
      const errorEl = document.getElementById("error");

      async function poll() {
        try {
          const response = await fetch(statusUrl, { credentials: "include", cache: "no-store" });
          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload?.message || "Status check failed (" + response.status + ")");
          }

          const status = payload?.data?.status;
          if (status === "ready" && payload?.data?.authUrl) {
            window.location.replace(payload.data.authUrl);
            return;
          }

          if (status === "failed" || status === "expired") {
            messageEl.textContent = "We could not start Microsoft sign-in.";
            errorEl.textContent = payload?.data?.errorMessage || "Please close this page and try again.";
            return;
          }

          window.setTimeout(poll, 1200);
        } catch (error) {
          messageEl.textContent = "Still waiting for central auth...";
          errorEl.textContent = error instanceof Error ? error.message : "Unexpected login error.";
          window.setTimeout(poll, 1800);
        }
      }

      poll();
    </script>
  </body>
</html>`;
  }
}

export async function getAccessToken() {
  const response = await axios.post(
    `https://login.microsoftonline.com/${process.env.SHAREPOINT_TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.SHAREPOINT_CLIENT_ID!,
      client_secret: process.env.SHAREPOINT_CLIENT_SECRET!,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    })
  );

  return response.data.access_token;
}