import Errors from "../errors";
import { JobAttributes } from "../../models/job";
import { JobRepository } from "../repositories/job";
import { UserRepository } from "../repositories/user";
import { getTransaction } from "../config/database";
import { DEFAULT_ORGANIZATION_ID } from "../constants/system";
import { Transaction } from "sequelize";
import axios from "axios";

export interface CreateJobPayload {
  title?: string;
  department?: string;
  departmentId?: string;
  location?: string;
  locationId?: string;
  jobRoleId?: string;
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
  pipelineConfig?: PipelineStagePayload[];
  requirements: Record<string, unknown>;
}

export interface PipelineStagePayload {
  id?: string;
  name: string;
  interviewerIds?: string[];
  interviewerEmails?: string[];
}

function sanitizePipelineConfig(pipelineConfig?: PipelineStagePayload[]) {
  if (!Array.isArray(pipelineConfig)) {
    return null;
  }

  return pipelineConfig
    .map((stage, index) => ({
      id: stage.id || `round-${index + 1}`,
      name: stage.name.trim(),
      interviewerIds: Array.isArray(stage.interviewerIds) ? stage.interviewerIds : [],
      interviewerEmails: Array.isArray(stage.interviewerEmails) ? stage.interviewerEmails : [],
    }))
    .filter((stage) => stage.name.length > 0);
}

async function buildPanelPipeline(panelId?: string) {
  if (!panelId) {
    return null;
  }

  const panel = await JobRepository.findPanelById(panelId);
  if (!panel) {
    throw new Errors.BadRequestError("Interview panel not found.");
  }

  const members = Array.isArray(panel.members) ? panel.members : [];
  return [{
    id: "round-1",
    name: panel.name || "Panel Interview",
    interviewerIds: members.map((member: any) => member.userId),
    interviewerEmails: members.map((member: any) => member.employee?.email).filter(Boolean),
  }];
}

export class JobService {
  public static async createJobWithCriteria(payload: CreateJobPayload, actingUserEmail?: string | null): Promise<any> {
    let transaction: Transaction | undefined;

    try {
      transaction = await getTransaction();

      const [department, location, jobRole, panel, actingUser] = await Promise.all([
        payload.departmentId ? JobRepository.findDepartmentById(payload.departmentId) : null,
        payload.locationId ? JobRepository.findLocationById(payload.locationId) : null,
        payload.jobRoleId ? JobRepository.findJobRoleById(payload.jobRoleId) : null,
        payload.panelId ? JobRepository.findPanelById(payload.panelId) : null,
        actingUserEmail ? UserRepository.findByEmail(actingUserEmail) : null,
      ]);

      const title = payload.title?.trim() || jobRole?.title;
      const departmentLabel = payload.department?.trim() || department?.name;
      const locationLabel = payload.location?.trim() || location?.name;

      if (!title || !departmentLabel || !locationLabel) {
        throw new Errors.BadRequestError("title, department, and location are required after resolving the selected catalog values.");
      }

      const pipelineConfig = sanitizePipelineConfig(payload.pipelineConfig) || await buildPanelPipeline(payload.panelId);

      const job = await JobRepository.createJob(
        {
          organizationId: DEFAULT_ORGANIZATION_ID,
          createdById: actingUser?.id || null,
          title,
          department: departmentLabel,
          departmentId: department?.id || payload.departmentId || null,
          location: locationLabel,
          locationId: location?.id || payload.locationId || null,
          jobRoleId: jobRole?.id || payload.jobRoleId || null,
          panelId: panel?.id || payload.panelId || null,
          headcount: payload.headcount,
          status: "Open",
          employmentType: payload.employmentType || null,
          workModel: payload.workModel || null,
          seniorityLevel: payload.seniorityLevel || jobRole?.level || null,
          experienceMin: payload.experienceMin ?? jobRole?.defaultExperienceMin ?? null,
          experienceMax: payload.experienceMax ?? jobRole?.defaultExperienceMax ?? null,
          salaryMin: payload.salaryMin ?? null,
          salaryMax: payload.salaryMax ?? null,
          currency: payload.currency || "USD",
          payFrequency: payload.payFrequency || "YEARLY",
          salaryVisibility: payload.salaryVisibility || "PUBLIC",
          aiMatchPercentage: null,
          reviewStatus: "approved",
          pipelineConfig,
        },
        transaction
      );

      const criteria = await JobRepository.createJobCriteria(
        {
          organizationId: DEFAULT_ORGANIZATION_ID,
          jobId: job.id,
          requirements: {
            ...payload.requirements,
            jobRoleId: jobRole?.id || payload.jobRoleId || null,
            panelId: panel?.id || payload.panelId || null,
            departmentId: department?.id || payload.departmentId || null,
            locationId: location?.id || payload.locationId || null,
            employmentType: payload.employmentType || null,
            workModel: payload.workModel || null,
            seniorityLevel: payload.seniorityLevel || jobRole?.level || null,
            experienceMin: payload.experienceMin ?? jobRole?.defaultExperienceMin ?? null,
            experienceMax: payload.experienceMax ?? jobRole?.defaultExperienceMax ?? null,
            salaryMin: payload.salaryMin ?? null,
            salaryMax: payload.salaryMax ?? null,
            currency: payload.currency || "USD",
            payFrequency: payload.payFrequency || "YEARLY",
            salaryVisibility: payload.salaryVisibility || "PUBLIC",
          },
          isActive: true,
        },
        transaction
      );

      await transaction.commit();

      const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";

      fetch(fastApiUrl + "/api/jobs/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
          title: job.title,
          requirements: criteria.requirements,
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const errorText = await response.text();
            console.error("FastAPI Job Setup failed: " + errorText);
          } else {
            console.log("[Job Setup] Triggered AI target generation for Job ID: " + job.id);
          }
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("Failed to reach FastAPI for job " + job.id + ": " + message);
        });

      return {
        job,
        criteria,
      };
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  public static async listJobsForHR(
    status?: JobAttributes["status"],
    reviewStatus?: JobAttributes["reviewStatus"]
  ) {
    const [result, statusCounts] = await Promise.all([
      JobRepository.findJobsForHR(status, reviewStatus),
      JobRepository.countJobsByStatus(),
    ]);

    return {
      jobs: result.rows,
      total: typeof result.count === "number" ? result.count : result.count.length,
      statusCounts,
    };
  }

  public static async getJobForHR(jobId: string) {
    const job = await JobRepository.findJobById(jobId);

    if (!job) {
      throw new Errors.BadRequestError("Job not found for the supplied jobId.");
    }

    return job;
  }

  public static async updateJobReviewStatus(
    jobId: string,
    status: JobAttributes["status"],
    reviewStatus: JobAttributes["reviewStatus"]
  ) {
    await this.getJobForHR(jobId);

    const affectedCount = await JobRepository.updateJob(jobId, {
      status,
      reviewStatus,
    });

    if (!affectedCount) {
      throw new Errors.SystemError("Job review status could not be updated.");
    }

    return this.getJobForHR(jobId);
  }

  public static async updatePipelineConfig(jobId: string, pipelineConfig: PipelineStagePayload[]) {
    await this.getJobForHR(jobId);
    const sanitizedPipelineConfig = sanitizePipelineConfig(pipelineConfig) || [];

    const affectedCount = await JobRepository.updateJob(jobId, {
      pipelineConfig: sanitizedPipelineConfig,
    });

    if (!affectedCount) {
      throw new Errors.SystemError("Job pipeline configuration could not be updated.");
    }

    return this.getJobForHR(jobId);
  }
  public static async processDraftJobEvaluation(payload: {
    title: string;
    department: string;
    level: string;
    requirements: any;
    organizationId: string;
    createdById: string;
  }) {
    const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";
    let aiEvaluation;

    // 1. Call Python AI for evaluation
    try {
      const aiResponse = await axios.post(`${PYTHON_API_URL}/api/jobs/evaluate-jd`, {
        title: payload.title,
        department: payload.department,
        level: payload.level,
        requirements: payload.requirements,
      });
      aiEvaluation = aiResponse.data;
    } catch (aiError) {
      console.error("[JobService] Python AI call failed:", aiError);
      aiEvaluation = {
        confidenceScore: 0,
        isApproved: false,
        mismatchedSkills: ["AI Service Unavailable"],
        warnings: ["Job requires manual HR review due to system error."],
      };
    }

    // 2. Determine Job Status
    const jobStatus: JobAttributes["status"] = aiEvaluation.isApproved ? "Open" : "Draft";
    const reviewStatus = aiEvaluation.isApproved ? "approved" : "needs_review";
    const formattedRequirements = typeof payload.requirements === "string" 
      ? { rawText: payload.requirements } 
      : payload.requirements;

    // 3. Database Transaction via Repository
    let transaction: Transaction | undefined;
    let newJob;

    try {
      transaction = await getTransaction();

      newJob = await JobRepository.createJob(
        {
          organizationId: payload.organizationId || DEFAULT_ORGANIZATION_ID,
          createdById: payload.createdById,
          title: payload.title,
          department: payload.department || "Unassigned",
          location: "Remote",
          status: jobStatus,
          reviewStatus: reviewStatus,
          headcount: 1,
          aiMatchPercentage: aiEvaluation.confidenceScore,
        },
        transaction
      );

      await JobRepository.createJobCriteria(
        {
          organizationId: payload.organizationId || DEFAULT_ORGANIZATION_ID,
          jobId: newJob.id,
          requirements: formattedRequirements,
          isActive: true,
        },
        transaction
      );

      await transaction.commit();
    } catch (dbError) {
      if (transaction) await transaction.rollback();
      throw new Errors.SystemError("Failed to create draft job in database.");
    }

    // 4. Post-Creation Hook for AI Vector Setup
    if (aiEvaluation.isApproved) {
      const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";
      axios.post(`${fastApiUrl}/api/jobs/setup`, {
        jobId: newJob.id,
        title: newJob.title,
        requirements: formattedRequirements,
      }).catch((err) => console.error("Failed to trigger FastAPI job setup:", err.message));
    }

    return { job: newJob, aiEvaluation };
  }
}
