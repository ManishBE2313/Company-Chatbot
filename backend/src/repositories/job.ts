import { Transaction } from "sequelize";
import { JobAttributes } from "../../models/job";
import { JobCriteriaAttributes } from "../../models/jobCriteria";
import { Job, JobCriteria } from "../config/database";

export class JobRepository {
  /**
   * Creates a new Job entry in the jobs table.
   */
  public static async createJob(
    payload: Partial<JobAttributes>,
    transaction: Transaction
  ): Promise<any> {
    return Job.create(payload, { transaction });
  }

  /**
   * Creates the linked Job Criteria (Requirements) in the job_criteria table.
   */
  public static async createJobCriteria(
    payload: Partial<JobCriteriaAttributes>,
    transaction: Transaction
  ): Promise<any> {
    return JobCriteria.create(payload, { transaction });
  }

  /**
   * Fetches a job along with its criteria by Job ID.
   */
  public static async findJobWithCriteria(
    jobId: string,
    transaction?: Transaction
  ): Promise<any> {
    return Job.findOne({
      where: { id: jobId },
      include: [
        {
          model: JobCriteria,
          as: "criteria",
        },
      ],
      transaction,
    });
  }
}