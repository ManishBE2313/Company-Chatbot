import { Transaction } from "sequelize";
import { JobRepository } from "../repositories/job";
import { getTransaction } from "../config/database";
import Errors from "../errors";

export interface CreateJobPayload {
  title: string;
  department: string;
  location: string;
  headcount: number;
  requirements: Record<string, unknown>; // Matches the JSONB requirement field
}

export class JobService {
  /**
   * Creates a job, saves its criteria, and tells the AI to generate target vectors.
   */
  public static async createJobWithCriteria(payload: CreateJobPayload): Promise<any> {
    let transaction: Transaction | undefined;

    try {
      transaction = await getTransaction();

      // 1. Create the Job in the database
      const job = await JobRepository.createJob(
        {
          title: payload.title,
          department: payload.department,
          location: payload.location,
          headcount: payload.headcount,
          status: "Open", // Automatically open the job so candidates can apply
        },
        transaction
      );

      // 2. Create the Job Criteria (the requirements)
      const criteria = await JobRepository.createJobCriteria(
        {
          jobId: job.id,
          requirements: payload.requirements,
          isActive: true,
        },
        transaction
      );

      // 3. Commit the transaction (save permanently to the database)
      await transaction.commit();

      // 4. Trigger the Python AI to generate the ICP and HyDE vectors
      // We use fetch without "await" so the Node.js API responds instantly
      // while Python works in the background.
      const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";

      fetch(`${fastApiUrl}/api/jobs/setup`, {
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
            console.error(`FastAPI Job Setup failed: ${errorText}`);
          } else {
            console.log(`[Job Setup] Triggered AI target generation for Job ID: ${job.id}`);
          }
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error(`Failed to reach FastAPI for job ${job.id}: ${message}`);
        });

      return {
        job,
        criteria,
      };
    } catch (error) {
      // If anything fails before the commit, undo the database changes
      if (transaction) {
        await transaction.rollback();
      }
      throw error;
    }
  }
}