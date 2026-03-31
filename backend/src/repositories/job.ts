import { Transaction, WhereOptions, fn, col } from "sequelize";
import { JobAttributes } from "../../models/job";
import { JobCriteriaAttributes } from "../../models/jobCriteria";
import { Department, InterviewPanel, InterviewPanelMember, Job, JobCriteria, JobRole, Location, User } from "../config/database";

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
    return Job.findByPk(jobId, {
      include: [
        { model: JobCriteria, as: "criteria" },
        { model: JobRole, as: "jobRole" },
        { model: Location, as: "locationRef" },
        { model: InterviewPanel, as: "panel" },
      ],
    });
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
      include: [
        { model: JobRole, as: "jobRole" },
        { model: Location, as: "locationRef" },
        { model: InterviewPanel, as: "panel" },
      ],
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

  public static async findDepartmentById(id: string) {
    return Department.findByPk(id);
  }

  public static async findLocationById(id: string) {
    return Location.findByPk(id);
  }

  public static async findJobRoleById(id: string) {
    return JobRole.findByPk(id);
  }

  public static async findPanelById(id: string) {
    return InterviewPanel.findByPk(id, {
      include: [
        {
          model: InterviewPanelMember,
          as: "members",
          include: [{ model: User, as: "employee", attributes: ["id", "email"] }],
        },
      ],
    });
  }
}
