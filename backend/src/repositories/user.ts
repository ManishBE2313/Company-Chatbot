import { Op } from "sequelize";
import { AccessRole, Department, EmployeeRole, InterviewPanel, InterviewPanelMember, JobRole, JobRoleSkill, Location, Skill, User } from "../config/database";
import { UserRole } from "../../models/user";
import { DEFAULT_ORGANIZATION_ID } from "../constants/system";

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
      existingUser.firstName = payload.firstName?.trim() || existingUser.firstName;
      existingUser.lastName = payload.lastName?.trim() || existingUser.lastName || null;
      existingUser.lastLoginAt = new Date();
      existingUser.organizationId = existingUser.organizationId || DEFAULT_ORGANIZATION_ID;
      await existingUser.save();
      return { user: existingUser, created: false };
    }

    const fallbackFirstName = email.split("@")[0] || "User";
    const user = await User.create({
      organizationId: DEFAULT_ORGANIZATION_ID,
      email,
      firstName: payload.firstName?.trim() || fallbackFirstName,
      lastName: payload.lastName?.trim() || null,
      lastLoginAt: new Date(),
      role: "user",
      status: "active",
      isActive: true,
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

  public static async findById(id: string) {
    return User.findByPk(id);
  }

  public static async listEmployeesWithRoles() {
    return User.findAll({
      order: [["firstName", "ASC"]],
      include: [
        { model: Department, as: "department" },
        {
          model: EmployeeRole,
          as: "roleAssignments",
          include: [{ model: AccessRole, as: "role" }],
        },
      ],
    });
  }

  public static async listAssignableRoles() {
    return AccessRole.findAll({
      where: { organizationId: DEFAULT_ORGANIZATION_ID },
      order: [["name", "ASC"]],
    });
  }

  public static async replaceRoles(userId: string, roleIds: string[]) {
    await EmployeeRole.destroy({ where: { userId } });

    for (const roleId of roleIds) {
      await EmployeeRole.create({
        organizationId: DEFAULT_ORGANIZATION_ID,
        userId,
        roleId,
        departmentId: null,
      });
    }
  }

  public static async findRolesByNames(roleNames: string[]) {
    return AccessRole.findAll({
      where: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        name: { [Op.in]: roleNames },
      },
    });
  }

  public static async findAssignedRoleNames(userId: string) {
    const assignments = await EmployeeRole.findAll({
      where: { userId },
      include: [{ model: AccessRole, as: "role" }],
    }) as any[];

    return assignments.map((assignment) => assignment.role?.name).filter(Boolean);
  }

  public static async findEligibleInterviewers() {
    return await User.findAll({
      where: {
        role: {
          [Op.in]: ["interviewer", "admin", "superadmin"],
        },
        isActive: true,
      },
      attributes: ["id", "firstName", "lastName", "email", "role"],
      order: [["firstName", "ASC"]],
    });
  }
}

export class CatalogRepository {
  public static async getJobCreationCatalog() {
    const [departments, locations, skills, jobRoles, panels] = await Promise.all([
      Department.findAll({ order: [["name", "ASC"]] }),
      Location.findAll({ order: [["country", "ASC"], ["city", "ASC"]] }),
      Skill.findAll({ where: { isActive: true }, order: [["category", "ASC"], ["name", "ASC"]] }),
      JobRole.findAll({
        where: { isActive: true },
        order: [["title", "ASC"]],
        include: [
          {
            model: JobRoleSkill,
            as: "roleSkills",
            include: [{ model: Skill, as: "skill" }],
          },
        ],
      }),
      InterviewPanel.findAll({
        where: { status: "active" },
        order: [["name", "ASC"]],
        include: [
          {
            model: InterviewPanelMember,
            as: "members",
            include: [{ model: User, as: "employee", attributes: ["id", "firstName", "lastName", "email", "role"] }],
          },
        ],
      }),
    ]);

    return { departments, locations, skills, jobRoles, panels };
  }
}
