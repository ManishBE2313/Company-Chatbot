import Errors from "../errors";
import { JobService } from "./job";
import { ApplicationRepository } from "../repositories/application";
import { JobApplicationAttributes } from "../../models/jobApplication";
import { ScorecardRepository } from "../repositories/ScorecardRepository";
import { InterviewRepository } from "../repositories/InterviewRepository";

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
    const affectedCount = await ApplicationRepository.updateApplicationStatus(applicationId, status);

    if (!affectedCount) {
      throw new Errors.SystemError("Application status could not be updated.");
    }

    application.status = status;
    return application;
  }

  public static async createScorecard(payload: any) {
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

    if (interview.interviewerId.toString() !== interviewerId) {
      throw new Error("Unauthorized interviewer");
    }

    const existing = await ScorecardRepository.findByInterviewId(interviewId);
    if (existing) {
      throw new Error("Scorecard already submitted");
    }

    return await ScorecardRepository.create({
      interviewId,
      interviewerId,
      technicalScore,
      communicationScore,
      recommendation,
      notes,
    });
  }
}
