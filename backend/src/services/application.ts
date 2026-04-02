import Errors from "../errors";
import { JobService } from "./job";
import { ApplicationRepository } from "../repositories/application";
import { JobApplicationAttributes } from "../../models/jobApplication";
import { ScorecardRepository } from "../repositories/ScorecardRepository";
import { InterviewRepository } from "../repositories/InterviewRepository";
import { UserRepository } from "../repositories/user";
import { Op } from "sequelize";
import { JobApplication, Job, Interview } from "../config/database";


export class ApplicationService {
  public static async listAllApplications(filters: {
    jobId?: string;
    status?: JobApplicationAttributes["status"];
  }) {
    return ApplicationRepository.findAllApplications(filters);
  }

  public static async listApplicationsByJob(
    jobId: string,
    status?: JobApplicationAttributes["status"]
  ) {
    const job = await JobService.getJobForHR(jobId);
    const applications = await ApplicationRepository.findApplicationsByJobId(jobId, status);

    return {
      job,
      applications,
    };
  }

  public static async getApplicationById(applicationId: string) {
    const application = await ApplicationRepository.findApplicationById(applicationId);

    if (!application) {
      throw new Errors.BadRequestError("Application not found for the supplied applicationId.");
    }

    return application;
  }

  public static async getPipelineStats(jobId: string) {
    await JobService.getJobForHR(jobId);
    const counts = await ApplicationRepository.countApplicationsByStatus(jobId);

    return {
      total:
        counts.PENDING +
        counts.SCREENED +
        counts.SCHEDULING +
        counts.SCHEDULED +
        counts.EVALUATING +
        counts.OFFERED +
        counts.REJECTED +
        counts.WITHDRAWN,
      pending: counts.PENDING,
      screened: counts.SCREENED,
      scheduling: counts.SCHEDULING,
      scheduled: counts.SCHEDULED,
      evaluating: counts.EVALUATING,
      offered: counts.OFFERED,
      rejected: counts.REJECTED,
      withdrawn: counts.WITHDRAWN,
    };
  }

  public static async overrideApplicationStatus(
    applicationId: string,
    status: JobApplicationAttributes["status"]
  ) {
    const application = await this.getApplicationById(applicationId);
    
    // 1. Update the specific candidate's status
    const affectedCount = await ApplicationRepository.updateApplicationStatus(applicationId, status);

    if (!affectedCount) {
      throw new Errors.SystemError("Application status could not be updated.");
    }

    application.status = status;

    // --- SMART LOGIC: Auto-Close Job & Clean Pipeline on "OFFERED" ---
    if (status === "OFFERED") {
      const jobId = application.jobId;
      const job = application.job;

      // Count how many people currently have an "OFFERED" status for this specific job
      const offeredCount = await JobApplication.count({
        where: {
          jobId: jobId,
          status: "OFFERED",
        },
      });

      // If the number of offers meets or exceeds the job's headcount
      if (job && offeredCount >= job.headcount) {
        
        // A. Close the Job
        await Job.update({ status: "Closed" }, { where: { id: jobId } });

        // B. Mass-Reject everyone else who is still in the active pipeline
        await JobApplication.update(
          { status: "REJECTED" },
          {
            where: {
              jobId: jobId,
              status: {
                [Op.notIn]: ["OFFERED", "REJECTED", "WITHDRAWN"], // Ignore people who are already finished
              },
            },
          }
        );

        // C. Cancel all upcoming scheduled interviews for the rejected candidates
        // C. Cancel all upcoming scheduled interviews for the rejected candidates
        // Step 1: Get the IDs of the applications we just rejected
        const rejectedApps = await JobApplication.findAll({
          attributes: ["id"],
          where: {
            jobId: jobId,
            status: "REJECTED",
          },
        });

        const rejectedAppIds = rejectedApps.map((app: any) => app.id);

        // Step 2: Cancel any scheduled interviews tied to those application IDs
        if (rejectedAppIds.length > 0) {
          await Interview.update(
            { status: "CANCELED" },
            {
              where: {
                status: "SCHEDULED",
                applicationId: {
                  [Op.in]: rejectedAppIds,
                },
              },
            }
          );
        }

        console.log(`[System] Job ${jobId} reached headcount of ${job.headcount}. Job closed and remaining candidates rejected/interviews canceled.`);
      }
    }

    return application;
  }

  public static async createScorecard(payload: any, actingUserEmail?: string | null) {
    const {
      interviewId,
      interviewerId,
      technicalScore,
      communicationScore,
      recommendation,
      notes,
    } = payload;

    if (technicalScore < 1 || technicalScore > 10) {
      throw new Error("Invalid technical score");
    }

    if (communicationScore < 1 || communicationScore > 10) {
      throw new Error("Invalid communication score");
    }

    const interview = await InterviewRepository.findById(interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    const actingUser = actingUserEmail ? await UserRepository.findByEmail(actingUserEmail) : null;
    const actingUserRole = actingUser?.role ?? "user";
    const isPrivilegedReviewer = actingUserRole === "admin" || actingUserRole === "superadmin";
    const effectiveInterviewerId = actingUser?.id || interviewerId;

    if (!isPrivilegedReviewer && interview.interviewerId.toString() !== effectiveInterviewerId) {
      throw new Error("Unauthorized interviewer");
    }

    const existing = await ScorecardRepository.findByInterviewId(interviewId);
    if (existing) {
      throw new Error("Scorecard already submitted");
    }

    return await ScorecardRepository.create({
      interviewId,
      interviewerId: effectiveInterviewerId,
      organizationId: interview.organizationId,
      technicalScore,
      communicationScore,
      recommendation,
      notes,
    });
  }
}
