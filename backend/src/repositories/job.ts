import { Transaction, WhereOptions, fn, col } from "sequelize";
import { JobAttributes } from "../../models/job";
import { JobCriteriaAttributes } from "../../models/jobCriteria";
import { Job, JobCriteria } from "../config/database";

interface JobStatusCountRow {
  status: JobAttributes["status"];
  count: string;
}

export class JobRepository {
  public static async createJob(
    payload: Partial<JobAttributes>,
    transaction: Transaction
  ): Promise<any> {
    return Job.create(payload, { transaction });
  }

  public static async createJobCriteria(
    payload: Partial<JobCriteriaAttributes>,
    transaction: Transaction
  ): Promise<any> {
    return JobCriteria.create(payload, { transaction });
  }

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

  public static async findJobById(jobId: string): Promise<any> {
    return Job.findByPk(jobId);
  }

  public static async updateJob(jobId: string, updateData: Partial<JobAttributes>) {
    const [affectedCount] = await Job.update(updateData, {
      where: { id: jobId },
    });

    return affectedCount;
  }

  public static async findJobsForHR(status?: JobAttributes["status"]): Promise<any> {
    const where: WhereOptions<JobAttributes> = {};

    if (status) {
      where.status = status;
    }

    return Job.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
    });
  }

  public static async countJobsByStatus(): Promise<Record<JobAttributes["status"], number>> {
    const counts: Record<JobAttributes["status"], number> = {
      Draft: 0,
      Open: 0,
      Paused: 0,
      Closed: 0,
    };

    const rows = await Job.findAll({
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      group: ["status"],
      raw: true,
    }) as unknown as JobStatusCountRow[];

    for (const row of rows) {
      counts[row.status] = Number(row.count) || 0;
    }

    return counts;
  }
}
