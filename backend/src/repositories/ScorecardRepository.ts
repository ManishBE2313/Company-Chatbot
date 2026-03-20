import { Scorecard } from "../config/database";

export class ScorecardRepository {
  public static async findByInterviewId(interviewId: string) {
    return await Scorecard.findOne({
      where: { interviewId },
    });
  }

  public static async create(data: any) {
    return await Scorecard.create(data);
  }
}