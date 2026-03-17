import { Transaction } from "sequelize";
import { CandidateAttributes } from "../../models/candidate";
import { JobApplicationAttributes } from "../../models/jobApplication";
import { Candidate, Job, JobApplication, JobCriteria } from "../config/database";

export class CandidateRepository {
  public static async createCandidate(
    payload: Partial<CandidateAttributes>,
    transaction: Transaction
  ): Promise<any> {
    return Candidate.create(payload, { transaction });
  }

  public static async findCandidateById(candidateId: string, transaction?: Transaction): Promise<any> {
    return Candidate.findByPk(candidateId, { transaction });
  }

  public static async findCandidateByEmail(email: string, transaction?: Transaction): Promise<any> {
    return Candidate.findOne({
      where: { email },
      transaction,
    });
  }

  public static async createJobApplication(
    payload: Partial<JobApplicationAttributes>,
    transaction: Transaction
  ): Promise<any> {
    return JobApplication.create(payload, { transaction });
  }

  public static async updateJobApplication(
    applicationId: string,
    updateData: Partial<JobApplicationAttributes>,
    transaction: Transaction
  ): Promise<number> {
    const [affectedCount] = await JobApplication.update(updateData, {
      where: { id: applicationId },
      transaction,
    });

    return affectedCount;
  }

  public static async findJobApplicationById(applicationId: string, transaction?: Transaction): Promise<any> {
    return JobApplication.findByPk(applicationId, { transaction });
  }

  public static async findOpenJob(jobId: string, transaction?: Transaction): Promise<any> {
    return Job.findOne({
      where: {
        id: jobId,
        status: "Open",
      },
      transaction,
    });
  }

  public static async findActiveJobCriteriaByJobId(jobId: string, transaction?: Transaction): Promise<any> {
    return JobCriteria.findOne({
      where: {
        jobId,
        isActive: true,
      },
      transaction,
    });
  }
}
