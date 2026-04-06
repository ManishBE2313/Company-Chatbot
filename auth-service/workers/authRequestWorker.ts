import { Job, Worker } from "bullmq";
import { AuthRequest } from "../config/database";
import { createBullConnection } from "../config/redis";
import { runtimeConfig } from "../config/runtime";
import { AuthService } from "../services/auth";

export interface AuthRequestJobData {
  requestId: string;
  appCode: string;
  successRedirectUrl: string;
  failureRedirectUrl?: string | null;
  logoutRedirectUrl?: string | null;
  syncUserUrl?: string | null;
  returnTo?: string | null;
  requestedBy?: string | null;
  requestedFromIp?: string | null;
  requestedUserAgent?: string | null;
}

async function persistFailedRequest(job: Job<AuthRequestJobData>, message: string) {
  await AuthRequest.upsert({
    id: job.data.requestId,
    appCode: job.data.appCode,
    successRedirectUrl: job.data.successRedirectUrl,
    failureRedirectUrl: job.data.failureRedirectUrl || null,
    logoutRedirectUrl: job.data.logoutRedirectUrl || null,
    syncUserUrl: job.data.syncUserUrl || null,
    returnTo: job.data.returnTo || null,
    requestedBy: job.data.requestedBy || null,
    requestedFromIp: job.data.requestedFromIp || null,
    requestedUserAgent: job.data.requestedUserAgent || null,
    status: "failed",
    authUrl: null,
    errorMessage: message,
    expiresAt: new Date(Date.now() + runtimeConfig.authRequestTtlMs),
    completedAt: new Date(),
  });
}

async function processAuthRequest(job: Job<AuthRequestJobData>) {
  try {
    const successRedirectUrl = AuthService.assertAllowedRedirectUrl(job.data.successRedirectUrl, "successRedirectUrl");
    const failureRedirectUrl = job.data.failureRedirectUrl
      ? AuthService.assertAllowedRedirectUrl(job.data.failureRedirectUrl, "failureRedirectUrl")
      : null;
    const logoutRedirectUrl = job.data.logoutRedirectUrl
      ? AuthService.assertAllowedRedirectUrl(job.data.logoutRedirectUrl, "logoutRedirectUrl")
      : null;
    const syncUserUrl = job.data.syncUserUrl || null;

    const authUrl = await AuthService.getAuthCodeUrl(job.data.requestId);

    await AuthRequest.upsert({
      id: job.data.requestId,
      appCode: job.data.appCode,
      successRedirectUrl,
      failureRedirectUrl,
      logoutRedirectUrl,
      syncUserUrl,
      returnTo: job.data.returnTo || null,
      requestedBy: job.data.requestedBy || null,
      requestedFromIp: job.data.requestedFromIp || null,
      requestedUserAgent: job.data.requestedUserAgent || null,
      status: "ready",
      authUrl,
      errorMessage: null,
      expiresAt: new Date(Date.now() + runtimeConfig.authRequestTtlMs),
      completedAt: null,
    });

    return { requestId: job.data.requestId, authUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown auth request error.";
    await persistFailedRequest(job, message);
    throw error;
  }
}

let worker: Worker<AuthRequestJobData> | null = null;

export function startAuthRequestWorker() {
  if (worker) {
    return worker;
  }

  worker = new Worker<AuthRequestJobData>(
    runtimeConfig.authRequestQueueName,
    processAuthRequest,
    {
      connection: createBullConnection(),
      concurrency: runtimeConfig.authQueueConcurrency,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Processed auth request job ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Auth request job ${job?.id || "unknown"} failed: ${error.message}`);
  });

  return worker;
}