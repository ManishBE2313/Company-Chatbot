
export type JobStatus = "Open" | "Closed" | "Draft" | "Paused";

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  headcount: number;
  status: JobStatus;
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
  createdAt: string;
}

export type ApplicationStatus =
  | "Pending"
  | "Passed"
  | "Rejected"
  | "Interviewing"
  | "Offered"
  | "ManualReview";

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  resumeUrl: string;
  status: ApplicationStatus;
  aiScore: number | null;
  aiTags: string[] | null;
  aiReasoning: string | null;
  createdAt: string;
  updatedAt: string;
  candidate?: Candidate;
  job?: Job;
}

export interface UploadCVPayload {
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  resumeUrl: string;
}

export interface PipelineStats {
  total: number;
  pending: number;
  passed: number;
  rejected: number;
  interviewing: number;
  offered: number;
  manualReview: number;
}

export type UserRole = "user" | "admin" | "superadmin";

export interface HRUser {
  email: string;
  role: UserRole;
  is_sso: boolean;
}
