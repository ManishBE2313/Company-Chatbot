export type JobStatus = "Open" | "Closed" | "Draft" | "Paused";
export type UserRole = "user" | "interviewer" | "admin" | "superadmin";

export interface DepartmentCatalog {
  id: string;
  name: string;
  costCenterCode?: string | null;
}

export interface LocationCatalog {
  id: string;
  name: string;
  country: string;
  city: string;
}

export interface SkillCatalog {
  id: string;
  name: string;
  category: string;
  isActive?: boolean;
}

export interface JobRoleSkillCatalog {
  id: string;
  skillId: string;
  weight?: number | null;
  isMandatory: boolean;
  skill?: SkillCatalog;
}

export interface JobRoleCatalog {
  id: string;
  title: string;
  jobFamily?: string | null;
  level?: string | null;
  defaultExperienceMin?: number | null;
  defaultExperienceMax?: number | null;
  description?: string | null;
  roleSkills?: JobRoleSkillCatalog[];
}

export interface InterviewerSummary {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  role: UserRole;
}

export interface InterviewPanelMemberCatalog {
  id: string;
  userId: string;
  roleInPanel?: string | null;
  employee?: InterviewerSummary;
}

export interface InterviewPanelCatalog {
  id: string;
  name: string;
  members?: InterviewPanelMemberCatalog[];
}

export interface JobFormCatalog {
  departments: DepartmentCatalog[];
  locations: LocationCatalog[];
  skills: SkillCatalog[];
  jobRoles: JobRoleCatalog[];
  panels: InterviewPanelCatalog[];
}

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
  departmentId?: string | null;
  location: string;
  locationId?: string | null;
  jobRoleId?: string | null;
  panelId?: string | null;
  headcount: number;
  status: JobStatus;
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN" | null;
  workModel?: "ON_SITE" | "REMOTE" | "HYBRID" | null;
  seniorityLevel?: string | null;
  experienceMin?: number | null;
  experienceMax?: number | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  payFrequency?: "HOURLY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  salaryVisibility?: "PUBLIC" | "INTERNAL" | "HIDDEN" | null;
  reviewStatus?: "approved" | "needs_review" | "blocked";
  pipelineConfig?: PipelineStageConfig[] | null;
  jobRole?: JobRoleCatalog | null;
  locationRef?: LocationCatalog | null;
  panel?: InterviewPanelCatalog | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobPayload {
  title?: string;
  jobRoleId?: string;
  department?: string;
  departmentId?: string;
  location?: string;
  locationId?: string;
  panelId?: string;
  headcount: number;
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
  workModel?: "ON_SITE" | "REMOTE" | "HYBRID";
  seniorityLevel?: string;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  payFrequency?: "HOURLY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  salaryVisibility?: "PUBLIC" | "INTERNAL" | "HIDDEN";
  requirements: JobRequirements;
}

export interface JobRequirements {
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  mustHaveSkillIds?: string[];
  niceToHaveSkillIds?: string[];
  minYearsExperience?: number;
  maxYearsExperience?: number;
  educationLevel?: string;
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

export interface HRUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  is_sso: boolean;
}

export interface EmployeeListItem {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  role: UserRole;
  status: string;
  department?: { id: string; name: string } | null;
  roles: string[];
}

export interface RoleOption {
  id: string;
  name: string;
  description?: string | null;
}
