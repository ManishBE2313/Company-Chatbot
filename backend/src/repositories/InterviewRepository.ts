import { Interview } from "../config/database";


export class InterviewRepository {
  public static async findById(id: string) {
    return await Interview.findByPk(id);
  }
}