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
  TimesheetReviewResponse,
} from "@/types/hr";
import {
  SurveyAdminFilters,
  SurveyPublishPayload,
  SurveySummary,
  normalizeSurveyStatus,
} from "@/types/survey";

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

const employeeApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL2 || "http://localhost:3000",
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


export async function getAdminSurveys(
  filters?: Partial<SurveyAdminFilters>
): Promise<SurveySummary[]> {
  try {
    const response = await nextApiClient.get<{
      data: Array<
        Omit<SurveySummary, "status"> & {
          status?: string;
        }
      >;
    }>("/api/hr/surveys");

    const surveys = response.data.data.map((survey) => ({
      ...survey,
      status: normalizeSurveyStatus(survey.status),
    }));

    return surveys.filter((survey) => {
      const statusMatch =
        !filters?.status || filters.status === "ALL"
          ? true
          : survey.status === filters.status;
      const typeMatch =
        !filters?.type || filters.type === "ALL"
          ? true
          : survey.surveyType === filters.type;

      return statusMatch && typeMatch;
    });
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch surveys."));
  }
}

export async function publishAdminSurvey(
  payload: SurveyPublishPayload
): Promise<SurveySummary> {
  try {
    const response = await nextApiClient.post<{
      data: Omit<SurveySummary, "status"> & { status?: string };
    }>("/api/hr/surveys", payload);

    return {
      ...response.data.data,
      status: normalizeSurveyStatus(response.data.data.status),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to publish survey."));
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

export async function getTimesheetsForReview(claimMonth?: string): Promise<TimesheetReviewResponse> {
  try {
    const response = await employeeApiClient.get<{ data: TimesheetReviewResponse }>("/api/employee/timesheets/review", {
      params: claimMonth ? { claimMonth } : undefined,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch timesheets for review."));
  }
}

export async function reviewTimesheet(timesheetId: string, status: "approved" | "rejected", remarks?: string): Promise<void> {
  try {
    await employeeApiClient.patch(`/api/employee/timesheets/${timesheetId}/status`, {
      status,
      remarks,
    });
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update timesheet status."));
  }
}


