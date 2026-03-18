import { useEffect, useCallback, useState } from "react";
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
  getJobById,
  createJob,
  getApplicationsByJob,
  getApplicationById,
  getPipelineStats,
  updateApplicationStatus,
  uploadCandidateCV,
} from "@/services/hrApiClient";
import { fetchCurrentHRUser, fetchHRJobs } from "@/lib/redux/features/hr/HRSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/redux";

export function useHRCurrentUser() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.hr.currentUser);
  const status = useAppSelector((state) => state.hr.currentUserStatus);
  const error = useAppSelector((state) => state.hr.currentUserError);

  useEffect(() => {
    if (status === "idle") {
      void dispatch(fetchCurrentHRUser());
    }
  }, [dispatch, status]);

  const refetch = useCallback(() => {
    void dispatch(fetchCurrentHRUser());
  }, [dispatch]);

  return {
    user: user as HRUser | null,
    isLoading: status === "idle" || status === "loading",
    error,
    refetch,
  };
}

export function useJobs() {
  const dispatch = useAppDispatch();
  const jobs = useAppSelector((state) => state.hr.jobs);
  const status = useAppSelector((state) => state.hr.jobsStatus);
  const error = useAppSelector((state) => state.hr.jobsError);

  useEffect(() => {
    if (status === "idle") {
      void dispatch(fetchHRJobs());
    }
  }, [dispatch, status]);

  const refetch = useCallback(() => {
    void dispatch(fetchHRJobs());
  }, [dispatch]);

  return {
    jobs: jobs as Job[],
    isLoading: status === "idle" || status === "loading",
    error,
    refetch,
  };
}

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

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { applications, isLoading, error, refetch: fetch };
}

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

export function useCreateJob(onSuccess?: (job: Job) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const submit = useCallback(async (payload: CreateJobPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const job = await createJob(payload);
      onSuccess?.(job);
      void dispatch(fetchHRJobs());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, onSuccess]);

  return { submit, isLoading, error };
}

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

export function useUpdateApplicationStatus(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (applicationId: string, status: ApplicationStatus) => {
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
  }, [onSuccess]);

  return { submit, isLoading, error };
}
