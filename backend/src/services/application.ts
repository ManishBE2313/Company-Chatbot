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
        counts.Pending +
        counts.Passed +
        counts.Rejected +
        counts.Interviewing +
        counts.Offered +
        counts.ManualReview,
      pending: counts.Pending,
      passed: counts.Passed,
      rejected: counts.Rejected,
      interviewing: counts.Interviewing,
      offered: counts.Offered,
      manualReview: counts.ManualReview,
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

    // 1. Validate scores
    if (technicalScore < 1 || technicalScore > 10) {
      throw new Error("Invalid technical score");
    }

    if (communicationScore < 1 || communicationScore > 10) {
      throw new Error("Invalid communication score");
    }

    // 2. Fetch interview
    const interview = await InterviewRepository.findById(interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    // 3. Authorization
    if (interview.interviewerId.toString() !== interviewerId) {
      throw new Error("Unauthorized interviewer");
    }

    // 4. Check duplicate
    const existing = await ScorecardRepository.findByInterviewId(interviewId);
    if (existing) {
      throw new Error("Scorecard already submitted");
    }

    // 5. Create
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
