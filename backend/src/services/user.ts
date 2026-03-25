import { UserRole } from "../../models/user";
import { UserRepository } from "../repositories/user";

export interface SyncUserLoginPayload {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export class UserService {
  public static async syncUserLogin(payload: SyncUserLoginPayload) {
    return UserRepository.upsertUser(payload);
  }

  public static async getUserRoleByEmail(email: string): Promise<UserRole> {
    return UserRepository.findRoleByEmail(email);
  }

  /**
   * Retrieves the list of staff eligible to be assigned to interview pipelines.
   */
  public static async getEligibleInterviewers() {
    const interviewers = await UserRepository.findEligibleInterviewers();
    
    // Business logic: Ensure we always return an array, even if empty
    if (!interviewers) {
      return [];
    }
    
    return interviewers;
  }
}
