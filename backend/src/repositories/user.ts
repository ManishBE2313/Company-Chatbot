import { Op } from "sequelize";
import { UserRole } from "../../models/user";
import { User } from "../config/database";

interface UpsertUserPayload {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export class UserRepository {
  public static async upsertUser(payload: UpsertUserPayload) {
    const email = payload.email.trim();
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      existingUser.lastLoginAt = new Date();
      await existingUser.save({ fields: ["lastLoginAt"] });
      return { user: existingUser, created: false };
    }

    const fallbackFirstName = email.split("@")[0] || "User";
    const user = await User.create({
      email,
      firstName: payload.firstName?.trim() || fallbackFirstName,
      lastName: payload.lastName?.trim() || null,
      lastLoginAt: new Date(),
    });

    return { user, created: true };
  }

  public static async findRoleByEmail(email: string): Promise<UserRole> {
    const user = await User.findOne({ where: { email: email.trim() } });
    return (user?.role as UserRole | undefined) ?? "user";
  }

  public static async findByEmail(email: string) {
    return User.findOne({ where: { email: email.trim() } });
  }
  /**
   * Fetches all users who have permission to conduct interviews.
   */
  public static async findEligibleInterviewers() {
    return await User.findAll({
      where: {
        role: {
          [Op.in]: ["interviewer", "admin", "superadmin"],
        },
      },
      // Security: Only return the fields necessary for the frontend dropdown
      attributes: ["id", "firstName", "lastName", "email", "role"],
      order: [["firstName", "ASC"]],
    });
  }
}
