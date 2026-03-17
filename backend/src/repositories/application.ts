import { fn, col } from "sequelize";
import { Candidate, Job, JobApplication } from "../config/database";
import { JobApplicationAttributes } from "../../models/jobApplication";

interface ApplicationStatusCountRow {
  status: JobApplicationAttributes["status"];
  count: string;
}

export class ApplicationRepository {
  public static async findAllApplications(
    filters: {
      jobId?: string;
      status?: JobApplicationAttributes["status"];
    } = {}
  ): Promise<any[]> {
    return JobApplication.findAll({
      where: {
        ...(filters.jobId ? { jobId: filters.jobId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      include: [
        { model: Candidate, as: "candidate" },
        { model: Job, as: "job" },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  public static async findApplicationsByJobId(
    jobId: string,
    status?: JobApplicationAttributes["status"]
  ): Promise<any[]> {
    return this.findAllApplications({ jobId, status });
  }

  public static async findApplicationById(applicationId: string): Promise<any> {
    return JobApplication.findByPk(applicationId, {
      include: [
        { model: Candidate, as: "candidate" },
        { model: Job, as: "job" },
      ],
    });
  }

  public static async countApplicationsByStatus(jobId: string): Promise<Record<JobApplicationAttributes["status"], number>> {
    const counts: Record<JobApplicationAttributes["status"], number> = {
      Pending: 0,
      Passed: 0,
      Rejected: 0,
      Interviewing: 0,
      Offered: 0,
      ManualReview: 0,
    };

    const rows = await JobApplication.findAll({
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      where: { jobId },
      group: ["status"],
      raw: true,
    }) as unknown as ApplicationStatusCountRow[];

    for (const row of rows) {
      counts[row.status] = Number(row.count) || 0;
    }

    return counts;
  }

  public static async updateApplicationStatus(
    applicationId: string,
    status: JobApplicationAttributes["status"]
  ): Promise<number> {
    const [affectedCount] = await JobApplication.update(
      { status },
      { where: { id: applicationId } }
    );

    return affectedCount;
  }
}
