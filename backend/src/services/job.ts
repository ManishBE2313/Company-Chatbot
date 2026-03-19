import Errors from "../errors";
import { JobAttributes } from "../../models/job";
import { JobRepository } from "../repositories/job";
import { getTransaction } from "../config/database";
import { Transaction } from "sequelize";

export interface CreateJobPayload {
  title: string;
  department: string;
  location: string;
  headcount: number;
  requirements: Record<string, unknown>;
}

export class JobService {
  public static async createJobWithCriteria(payload: CreateJobPayload): Promise<any> {
    let transaction: Transaction | undefined;

    try {
      transaction = await getTransaction();

      const job = await JobRepository.createJob(
        {
          title: payload.title,
          department: payload.department,
          location: payload.location,
          headcount: payload.headcount,
          status: "Open",
        },
        transaction
      );

      const criteria = await JobRepository.createJobCriteria(
        {
          jobId: job.id,
          requirements: payload.requirements,
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

  public static async listJobsForHR(status?: JobAttributes["status"]) {
    const [result, statusCounts] = await Promise.all([
      JobRepository.findJobsForHR(status),
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
}
