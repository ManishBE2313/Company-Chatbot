import { Transaction } from "sequelize";
import { CandidateAttributes } from "../../models/candidate";
import { Candidate, JobCriteria } from "../config/database";

export class CandidateRepository {
  public static async createCandidate(
    payload: Partial<CandidateAttributes>,
    transaction: Transaction
  ): Promise<any> {
    return Candidate.create(payload, { transaction });
  }

  public static async updateCandidate(
    candidateId: string,
    updateData: Partial<CandidateAttributes>,
    transaction: Transaction
  ): Promise<number> {
    const [affectedCount] = await Candidate.update(updateData, {
      where: { id: candidateId },
      transaction,
    });

    return affectedCount;
  }

  public static async findCandidateById(candidateId: string, transaction?: Transaction): Promise<any> {
    return Candidate.findByPk(candidateId, { transaction });
  }

  public static async findActiveJobCriteria(jobId: string, transaction?: Transaction): Promise<any> {
    return JobCriteria.findOne({
      where: {
        id: jobId,
        isActive: true,
      },
      transaction,
    });
  }
}
