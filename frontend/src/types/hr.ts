export type JobStatus = "Open" | "Closed" | "Draft" | "Paused";

export interface PipelineStageConfig {
  id?: string;
  name: string;
  interviewerIds: string[];
  interviewerEmails?: string[];
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  headcount: number;
  status: JobStatus;
  pipelineConfig?: PipelineStageConfig[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobPayload {
  title: string;
  department: string;
  location: string;
  headcount: number;
  requirements: JobRequirements;
}

export interface JobRequirements {
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  minYearsExperience: number;
  educationLevel: string;
  notes?: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: string;
}

export type ApplicationStatus =
  | "PENDING"
  | "SCREENED"
  | "SCHEDULING"
  | "SCHEDULED"
  | "EVALUATING"
  | "OFFERED"
  | "REJECTED"
  | "WITHDRAWN";

export interface InterviewSlot {
  id: string;
  interviewerId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  interview?: Interview | null;
}

export interface InterviewerSummary {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  role: UserRole;
}

export interface Scorecard {
  id: string;
  interviewId: string;
  interviewerId: string;
  technicalScore: number;
  communicationScore: number;
  notes?: string | null;
  recommendation: "STRONG_HIRE" | "HIRE" | "HOLD" | "NO_HIRE";
  createdAt?: string;
  updatedAt?: string;
  interviewer?: InterviewerSummary;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  resumeUrl: string;
  status: ApplicationStatus;
  currentStage?: string | null;
  priorityScore?: number | null;
  aiScore: number | null;
  aiTags: string[] | null;
  aiReasoning: string | null;
  createdAt: string;
  updatedAt: string;
  candidate?: Candidate;
  job?: Job;
  interviews?: Interview[];
}

export interface Interview {
  id: string;
  applicationId: string;
  interviewerId: string;
  slotId: string;
  roundName: string;
  meetLink?: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
  createdAt?: string;
  updatedAt?: string;
  slot?: InterviewSlot;
  interviewer?: InterviewerSummary;
  application?: Application;
  scorecard?: Scorecard | null;
}

export interface UploadCVPayload {
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  resumeUrl: string;
}

export interface CreateInterviewSlotPayload {
  startTime: string;
  endTime: string;
}

export interface CreateScorecardPayload {
  interviewId: string;
  interviewerId: string;
  technicalScore: number;
  communicationScore: number;
  recommendation: "STRONG_HIRE" | "HIRE" | "HOLD" | "NO_HIRE";
  notes?: string;
}

export interface PipelineStats {
  total: number;
  pending: number;
  screened: number;
  scheduling: number;
  scheduled: number;
  evaluating: number;
  offered: number;
  rejected: number;
  withdrawn: number;
}

export type UserRole = "user" | "interviewer" | "admin" | "superadmin";

export interface HRUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  is_sso: boolean;
}
