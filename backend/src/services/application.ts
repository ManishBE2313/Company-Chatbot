import Errors from "../errors";
import { JobService } from "./job";
import { ApplicationRepository } from "../repositories/application";
import { JobApplicationAttributes } from "../../models/jobApplication";

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
}
