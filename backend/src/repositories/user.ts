import { Op } from "sequelize";
import { AccessRole, Department, EmployeeRole, InterviewPanel, InterviewPanelMember, JobRole, JobRoleSkill, Location, Organization, Skill, User } from "../config/database";
import { UserRole } from "../../models/user";
import { DEFAULT_ORGANIZATION_ID, DEFAULT_ORGANIZATION_NAME } from "../constants/system";
import { seedRoleNames } from "../data/initialCatalog";

interface UpsertUserPayload {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: UserRole | null;
  preserveExistingRole?: boolean;
}

const SYSTEM_ROLE_DESCRIPTIONS: Record<string, string> = {
  superadmin: "Full HR platform access.",
  admin: "Administrative HR access.",
  interviewer: "Can conduct interviews and submit scorecards.",
  hm: "Hiring manager workflow access.",
  hrbp: "HR business partner workflow access.",
  finance: "Finance workflow access.",
  executive: "Executive visibility access.",
  rmg: "Resource management access.",
  employee: "Default employee access.",
};

export class UserRepository {
  public static async ensureDefaultSecurityContext() {
    const [organization] = await Organization.findOrCreate({
      where: { id: DEFAULT_ORGANIZATION_ID },
      defaults: {
        id: DEFAULT_ORGANIZATION_ID,
        name: DEFAULT_ORGANIZATION_NAME,
        status: "active",
      },
    });

    if (organization.name !== DEFAULT_ORGANIZATION_NAME || organization.status !== "active") {
      organization.name = organization.name || DEFAULT_ORGANIZATION_NAME;
      organization.status = "active";
      await organization.save();
    }

    await Promise.all(
      seedRoleNames.map((roleName) =>
        AccessRole.findOrCreate({
          where: {
            organizationId: DEFAULT_ORGANIZATION_ID,
            name: roleName,
          },
          defaults: {
            organizationId: DEFAULT_ORGANIZATION_ID,
            name: roleName,
            description: SYSTEM_ROLE_DESCRIPTIONS[roleName] || `${roleName} access`,
            isSystem: true,
          },
        })
      )
    );
  }

  public static async upsertUser(payload: UpsertUserPayload) {
    await this.ensureDefaultSecurityContext();

    const email = payload.email.trim().toLowerCase();
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      existingUser.firstName = payload.firstName?.trim() || existingUser.firstName;
      existingUser.lastName = payload.lastName?.trim() || existingUser.lastName || null;
      existingUser.organizationId = existingUser.organizationId || DEFAULT_ORGANIZATION_ID;
      existingUser.isActive = true;
      existingUser.status = existingUser.status || "active";

      if (payload.role && !payload.preserveExistingRole) {
        existingUser.role = payload.role;
      }

      await existingUser.save();
      return { user: existingUser, created: false };
    }

    const fallbackFirstName = email.split("@")[0] || "User";
    const user = await User.create({
      organizationId: DEFAULT_ORGANIZATION_ID,
      email,
      firstName: payload.firstName?.trim() || fallbackFirstName,
      lastName: payload.lastName?.trim() || null,
      role: payload.role || "user",
      status: "active",
      isActive: true,
    });

    return { user, created: true };
  }

  public static async syncFromAuthClaims(payload: UpsertUserPayload) {
    return this.upsertUser({
      ...payload,
      preserveExistingRole: payload.preserveExistingRole ?? true,
    });
  }

  public static async findRoleByEmail(email: string): Promise<UserRole> {
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    return (user?.role as UserRole | undefined) ?? "user";
  }

  public static async findByEmail(email: string) {
    return User.findOne({ where: { email: email.trim().toLowerCase() } });
  }

  public static async findById(id: string) {
    return User.findByPk(id);
  }

  public static async ensureRoleAssignments(userId: string, roleNames: string[]) {
    await this.ensureDefaultSecurityContext();

    const uniqueRoleNames = Array.from(new Set(roleNames.filter(Boolean)));
    if (!uniqueRoleNames.length) {
      return [];
    }

    const roles = await AccessRole.findAll({
      where: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        name: {
          [Op.in]: uniqueRoleNames,
        },
      },
    }) as any[];

    const rolesByName = new Map(roles.map((role) => [role.name, role]));
    const assignedRoleIds: string[] = [];

    for (const roleName of uniqueRoleNames) {
      const role = rolesByName.get(roleName);
      if (!role) {
        continue;
      }

      assignedRoleIds.push(role.id);
      await EmployeeRole.findOrCreate({
        where: {
          organizationId: DEFAULT_ORGANIZATION_ID,
          userId,
          roleId: role.id,
          departmentId: null,
        },
        defaults: {
          organizationId: DEFAULT_ORGANIZATION_ID,
          userId,
          roleId: role.id,
          departmentId: null,
        },
      });
    }

    return assignedRoleIds;
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
    await this.ensureDefaultSecurityContext();

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
    await this.ensureDefaultSecurityContext();

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
