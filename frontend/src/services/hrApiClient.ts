import axios from "axios";
import {
  Job,
  CreateJobPayload,
  UpdateJobPayload,
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
  JobFormCatalog,
  EmployeeListItem,
  RoleOption,
  JobDescriptionTemplate,
  JobDescriptionAnalysis,
  TextSuggestionResult,
  SkillCatalog,
} from "@/types/hr";

const fastApiClient = axios.create({
  baseURL: "",
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

export async function getJobFormCatalog(): Promise<JobFormCatalog> {
  try {
    const response = await nextApiClient.get<{ data: JobFormCatalog }>("/api/hr/catalog/job-form");
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch job form catalog."));
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

export async function createJob(payload: CreateJobPayload, userEmail?: string): Promise<Job> {
  try {
    const response = await nextApiClient.post<{ data: Job }>(
      "/api/jobs/setup",
      payload,
      userEmail ? withUserEmail(userEmail) : undefined
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create job."));
  }
}

export async function updateJob(jobId: string, payload: UpdateJobPayload, userEmail?: string): Promise<Job> {
  try {
    const response = await nextApiClient.patch<{ data: Job }>(
      `/api/hr/jobs/${jobId}`,
      payload,
      userEmail ? withUserEmail(userEmail) : undefined
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update job."));
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

export async function getEmployeesForRoleManagement(userEmail: string): Promise<EmployeeListItem[]> {
  try {
    const response = await nextApiClient.get<{ data: EmployeeListItem[] }>(
      "/api/hr/user/employees",
      withUserEmail(userEmail)
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch employees."));
  }
}

export async function getAssignableRoles(userEmail: string): Promise<RoleOption[]> {
  try {
    const response = await nextApiClient.get<{ data: RoleOption[] }>(
      "/api/hr/user/roles",
      withUserEmail(userEmail)
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch roles."));
  }
}

export async function updateEmployeeRoles(
  userEmail: string,
  employeeId: string,
  roles: string[]
): Promise<void> {
  try {
    await nextApiClient.put(
      `/api/hr/user/${employeeId}/roles`,
      { roles },
      withUserEmail(userEmail)
    );
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update employee roles."));
  }
}


export async function getSettingsSkills(): Promise<SkillCatalog[]> {
  try {
    const response = await nextApiClient.get<{ data: SkillCatalog[] }>("/api/hr/settings/skills");
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch skills."));
  }
}

export async function createSettingsSkill(payload: { name: string; category: string }): Promise<SkillCatalog> {
  try {
    const response = await nextApiClient.post<{ data: SkillCatalog }>("/api/hr/settings/skills", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create skill."));
  }
}

export async function getJobDescriptionTemplates(): Promise<JobDescriptionTemplate[]> {
  try {
    const response = await nextApiClient.get<{ data: JobDescriptionTemplate[] }>("/api/hr/settings/job-descriptions");
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch job descriptions."));
  }
}

export async function analyzeJobDescription(payload: { title: string; description: string }): Promise<JobDescriptionAnalysis> {
  try {
    const response = await nextApiClient.post<{ data: JobDescriptionAnalysis }>("/api/hr/settings/job-descriptions/analyze", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to analyze job description."));
  }
}

export async function createJobDescriptionTemplate(payload: {
  title: string;
  jobRoleId?: string | null;
  description: string;
  refinedDescription?: string | null;
  mustHaveSkillIds?: string[];
  niceToHaveSkillIds?: string[];
}): Promise<JobDescriptionTemplate> {
  try {
    const response = await nextApiClient.post<{ data: JobDescriptionTemplate }>("/api/hr/settings/job-descriptions", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to save job description."));
  }
}

export async function getSuggestion(payload: { input: string; kind?: "skill" | "description" }): Promise<TextSuggestionResult> {
  try {
    const response = await nextApiClient.post<{ data: TextSuggestionResult }>("/api/hr/settings/suggest", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to get suggestion."));
  }
}

