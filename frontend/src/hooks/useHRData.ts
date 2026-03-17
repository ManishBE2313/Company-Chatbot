// src/hooks/useHRData.ts
// Custom hooks that wrap hrApiClient calls with loading/error state.
// Keeps all async logic out of components — components just call a hook.

import { useState, useEffect, useCallback } from "react";
import {
  Job,
  Application,
  ApplicationStatus,
  PipelineStats,
  HRUser,
  CreateJobPayload,
  UploadCVPayload,
} from "@/types/hr";
import {
  getHRCurrentUser,
  getJobs,
  getJobById,
  createJob,
  getApplicationsByJob,
  getApplicationById,
  getPipelineStats,
  updateApplicationStatus,
  uploadCandidateCV,
} from "@/services/hrApiClient";

// ─── Current HR User ─────────────────────────────────────────────────────────
// Fetches the logged-in user once on mount. Used by the HR layout
// to gate admin-only UI like "Create Job" and status override buttons.
export function useHRCurrentUser() {
  const [user, setUser] = useState<HRUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHRCurrentUser()
      .then(setUser)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  return { user, isLoading, error };
}

// ─── Jobs List ───────────────────────────────────────────────────────────────
// Loads all jobs on mount. Re-fetch is exposed so the list refreshes
// immediately after a new job is created.
export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setIsLoading(true);
    getJobs()
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { jobs, isLoading, error, refetch: fetch };
}

// ─── Single Job ───────────────────────────────────────────────────────────────
// Loads one job by ID. Skips the call if jobId is empty (e.g. before selection).
export function useJob(jobId: string) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    setIsLoading(true);
    getJobById(jobId)
      .then(setJob)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [jobId]);

  return { job, isLoading, error };
}

// ─── Applications List ────────────────────────────────────────────────────────
// Reloads whenever jobId or the active status tab changes.
// Passing undefined as status fetches all applications (the "All" tab).
export function useApplications(jobId: string, status?: ApplicationStatus) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!jobId) return;
    setIsLoading(true);
    getApplicationsByJob(jobId, status)
      .then(setApplications)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [jobId, status]);

  useEffect(() => { fetch(); }, [fetch]);

  return { applications, isLoading, error, refetch: fetch };
}

// ─── Single Application ───────────────────────────────────────────────────────
// Loads full application detail including AI score, tags and reasoning.
export function useApplication(applicationId: string) {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;
    setIsLoading(true);
    getApplicationById(applicationId)
      .then(setApplication)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [applicationId]);

  return { application, isLoading, error };
}

// ─── Pipeline Stats ───────────────────────────────────────────────────────────
// Loads dashboard counts (total, passed, rejected etc.) for one job.
export function usePipelineStats(jobId: string) {
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    setIsLoading(true);
    getPipelineStats(jobId)
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [jobId]);

  return { stats, isLoading, error };
}

// ─── Create Job (mutation) ────────────────────────────────────────────────────
// Returns a submit function + its own loading/error/success state.
// On success it calls the optional onSuccess callback so the parent can
// close the modal and refetch the jobs list.
export function useCreateJob(onSuccess?: (job: Job) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (payload: CreateJobPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const job = await createJob(payload);
      onSuccess?.(job);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);

  return { submit, isLoading, error };
}

// ─── Upload CV (mutation) ─────────────────────────────────────────────────────
// Submits a candidate CV and starts the AI screening pipeline.
// Calls onSuccess with the new applicationId so the UI can navigate to it.
export function useUploadCV(onSuccess?: (applicationId: string) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (payload: UploadCVPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await uploadCandidateCV(payload);
      onSuccess?.(result.applicationId);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);

  return { submit, isLoading, error };
}

// ─── Update Application Status (mutation) ────────────────────────────────────
// Admin-only action to override AI decision on manual review flagged applications.
// Calls onSuccess so the parent can refetch the list and close any open drawer.
export function useUpdateApplicationStatus(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (applicationId: string, status: ApplicationStatus) => {
      setIsLoading(true);
      setError(null);
      try {
        await updateApplicationStatus(applicationId, status);
        onSuccess?.();
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess]
  );

  return { submit, isLoading, error };
}