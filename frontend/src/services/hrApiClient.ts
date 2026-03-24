import axios from "axios";
import {
  Job,
  CreateJobPayload,
  Application,
  ApplicationStatus,
  UploadCVPayload,
  PipelineStats,
  HRUser,
  CreateInterviewSlotPayload,
  Interview,
  InterviewSlot,
  CreateScorecardPayload,
  PipelineStageConfig,
} from "@/types/hr";

const fastApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const nextApiClient = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; detail?: string } | undefined;
    return data?.message || data?.detail || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function withUserEmail(email: string) {
  return {
    headers: {
      "x-user-email": email,
    },
  };
}

export async function getHRCurrentUser(): Promise<HRUser> {
  try {
    const response = await fastApiClient.get<HRUser>("/api/user/me");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch current user."));
  }
}

export async function getJobs(): Promise<Job[]> {
  try {
    const response = await nextApiClient.get<{ data: Job[] }>("/api/hr/jobs");
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch jobs."));
  }
}

export async function getJobById(jobId: string): Promise<Job> {
  try {
    const response = await nextApiClient.get<{ data: Job }>(`/api/hr/jobs/${jobId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch job."));
  }
}

export async function createJob(payload: CreateJobPayload): Promise<Job> {
  try {
    const response = await nextApiClient.post<{ data: Job }>("/api/jobs/setup", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create job."));
  }
}

export async function getAllApplications(filters?: {
  jobId?: string;
  status?: ApplicationStatus;
}): Promise<Application[]> {
  try {
    const response = await nextApiClient.get<{ data: Application[] }>("/api/hr/applications", {
      params: filters,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch applications."));
  }
}

export async function getApplicationsByJob(
  jobId: string,
  status?: ApplicationStatus
): Promise<Application[]> {
  try {
    const response = await nextApiClient.get<{ data: Application[] }>(
      `/api/hr/jobs/${jobId}/applications`,
      {
        params: status ? { status } : undefined,
      }
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch applications."));
  }
}

export async function getApplicationById(applicationId: string): Promise<Application> {
  try {
    const response = await nextApiClient.get<{ data: Application }>(
      `/api/hr/applications/${applicationId}`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch application."));
  }
}

export async function uploadCandidateCV(
  payload: UploadCVPayload
): Promise<{ candidateId: string; applicationId: string; status: string }> {
  try {
    const response = await nextApiClient.post<{
      data: { candidateId: string; applicationId: string; status: string };
    }>("/api/candidates/upload", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to upload candidate CV."));
  }
}

export async function getPipelineStats(jobId: string): Promise<PipelineStats> {
  try {
    const response = await nextApiClient.get<{ data: PipelineStats }>(
      `/api/hr/jobs/${jobId}/stats`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch pipeline stats."));
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<void> {
  try {
    await nextApiClient.patch(`/api/hr/applications/${applicationId}/status`, {
      status,
    });
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update application status."));
  }
}

export async function getMyInterviewSlots(userEmail: string): Promise<InterviewSlot[]> {
  try {
    const response = await nextApiClient.get<{ data: InterviewSlot[] }>(
      "/api/slots/me",
      withUserEmail(userEmail)
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch interview slots."));
  }
}

export async function createInterviewSlot(
  userEmail: string,
  payload: CreateInterviewSlotPayload
): Promise<InterviewSlot> {
  try {
    const response = await nextApiClient.post<{ data: InterviewSlot }>(
      "/api/slots",
      payload,
      withUserEmail(userEmail)
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create interview slot."));
  }
}

export async function deleteInterviewSlot(userEmail: string, slotId: string): Promise<void> {
  try {
    await nextApiClient.delete(`/api/slots/${slotId}`, withUserEmail(userEmail));
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete interview slot."));
  }
}

export async function getMyInterviews(userEmail: string): Promise<Interview[]> {
  try {
    const response = await nextApiClient.get<{ data: Interview[] }>(
      "/api/interviews/me",
      withUserEmail(userEmail)
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch interviews."));
  }
}

export async function getScheduledInterviews(userEmail: string): Promise<Interview[]> {
  try {
    const response = await nextApiClient.get<{ data: Interview[] }>(
      "/api/interviews/scheduled",
      withUserEmail(userEmail)
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch scheduled interviews."));
  }
}

export async function submitScorecard(payload: CreateScorecardPayload, userEmail?: string) {
  try {
    const response = await nextApiClient.post<{ data: unknown }>(
      "/api/scorecard/create-scorecard",
      payload,
      userEmail ? withUserEmail(userEmail) : undefined
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to submit scorecard."));
  }
}

export async function updateJobPipeline(
  jobId: string,
  pipelineConfig: PipelineStageConfig[]
): Promise<Job> {
  try {
    const response = await nextApiClient.patch<{ data: Job }>(
      `/api/hr/jobs/${jobId}/pipeline`,
      { pipelineConfig }
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update pipeline config."));
  }
}
