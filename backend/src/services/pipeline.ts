import { Transaction } from "sequelize";
import { PipelineEvent, getTransaction } from "../config/database";
import { CandidateRepository } from "../repositories/candidate";
import { ApplicationStatus } from "../../models/jobApplication";
import Errors from "../errors";

const ALLOWED_TRANSITIONS: Partial<Record<ApplicationStatus, ApplicationStatus[]>> = {
  PENDING: ["SCREENED", "REJECTED", "WITHDRAWN"],
  SCREENED: ["SCHEDULING", "REJECTED", "WITHDRAWN"],
  SCHEDULING: ["SCHEDULED", "REJECTED", "WITHDRAWN"],
  SCHEDULED: ["EVALUATING", "REJECTED", "WITHDRAWN"],
  EVALUATING: ["OFFERED", "REJECTED", "WITHDRAWN"],
  OFFERED: ["WITHDRAWN"],
  REJECTED: [],
  WITHDRAWN: [],
};

export class PipelineService {
  public static async transitionState(
    applicationId: string,
    toStatus: ApplicationStatus,
    triggeredById?: string | null,
    notes?: string | null
  ) {
    let transaction: Transaction | undefined;

    try {
      transaction = await getTransaction();

      const application = await CandidateRepository.findJobApplicationById(applicationId, transaction);
      if (!application) {
        throw new Errors.BadRequestError("Job application not found.");
      }

      const fromStatus = application.status as ApplicationStatus;

      if (fromStatus !== toStatus) {
        const allowedTargets = ALLOWED_TRANSITIONS[fromStatus] || [];
        if (!allowedTargets.includes(toStatus)) {
          throw new Errors.BadRequestError(
            `Invalid pipeline transition from ${fromStatus} to ${toStatus}.`
          );
        }

        const affectedCount = await CandidateRepository.updateJobApplication(
          applicationId,
          { status: toStatus },
          transaction
        );

        if (!affectedCount) {
          throw new Errors.SystemError("Job application status could not be updated.");
        }
      }

      await PipelineEvent.create(
        {
          applicationId,
          triggeredById: triggeredById || null,
          eventType: "STATE_TRANSITION",
          fromStatus,
          toStatus,
          notes: notes || null,
        },
        { transaction }
      );

      await transaction.commit();

      if (fromStatus === toStatus) {
        application.status = toStatus;
        return application;
      }

      return CandidateRepository.findJobApplicationById(applicationId);
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      throw error;
    }
  }
}
