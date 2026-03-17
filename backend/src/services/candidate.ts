import { Transaction } from "sequelize";
import { CandidateRepository } from "../repositories/candidate";
import { getTransaction } from "../config/database";
import Errors from "../errors";

export interface UploadCVPayload {
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  resumeUrl: string;
}

export class CandidateService {
  public static async processCVUpload(
    payload: UploadCVPayload,
    _schemaCompanyId?: string
  ): Promise<any> {
    let transaction: Transaction | undefined;

    try {
      transaction = await getTransaction();

      const job = await CandidateRepository.findOpenJob(payload.jobId, transaction);
      if (!job) {
        throw new Errors.BadRequestError("Open job not found for the supplied jobId.");
      }

      const jobCriteria = await CandidateRepository.findActiveJobCriteriaByJobId(
        payload.jobId,
        transaction
      );

      if (!jobCriteria) {
        throw new Errors.BadRequestError("Active job criteria not found for the supplied jobId.");
      }

      let candidate = await CandidateRepository.findCandidateByEmail(payload.email, transaction);
      if (!candidate) {
        candidate = await CandidateRepository.createCandidate(
          {
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
          },
          transaction
        );
      }

      const application = await CandidateRepository.createJobApplication(
        {
          candidateId: candidate.id,
          jobId: payload.jobId,
          resumeUrl: payload.resumeUrl,
          status: "Pending",
        },
        transaction
      );

      await transaction.commit();

      const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";
      const webhookUrl = process.env.NODE_WEBHOOK_URL || "http://127.0.0.1:3000/api/webhooks/ai-result";

      void fetch(`${fastApiUrl}/api/ai/queue-cv-screening`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: application.id,
          candidateId: candidate.id,
          resumeUrl: payload.resumeUrl,
          jobId: payload.jobId,
          webhookUrl,
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `FastAPI returned status ${response.status}`);
          }
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error(`Failed to trigger AI screening for application ${application.id}: ${message}`);
        });

      return {
        candidate,
        application,
      };
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      throw error;
    }
  }
}
