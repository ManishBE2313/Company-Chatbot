import { QueryTypes } from "sequelize";
import { sequelize, Organization, Department, Location, AccessRole, Skill, JobRole, JobRoleSkill, Employee, EmployeeRole } from "../config/database";
import { DEFAULT_ORGANIZATION_ID, DEFAULT_ORGANIZATION_NAME, PRIMARY_ROLE_RANK } from "../constants/system";
import { seedDepartments, seedJobRoles, seedLocations, seedRoleNames, seedSkills } from "../data/initialCatalog";

function normalizePrimaryRole(roleNames: string[]) {
  for (const role of PRIMARY_ROLE_RANK) {
    if (roleNames.includes(role)) {
      return role;
    }
  }

  return "user";
}

async function ensureOrganization() {
  const [organization] = await Organization.findOrCreate({
    where: { id: DEFAULT_ORGANIZATION_ID },
    defaults: {
      id: DEFAULT_ORGANIZATION_ID,
      name: DEFAULT_ORGANIZATION_NAME,
      status: "active",
    },
  });

  return organization;
}

async function seedDepartmentsForOrg() {
  for (const department of seedDepartments) {
    await Department.findOrCreate({
      where: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        name: department.name,
      },
      defaults: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        name: department.name,
        costCenterCode: department.costCenterCode,
      },
    });
  }
}

async function seedLocationsForOrg() {
  for (const location of seedLocations) {
    await Location.findOrCreate({
      where: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        name: location.name,
      },
      defaults: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        name: location.name,
        country: location.country,
        city: location.city,
      },
    });
  }
}

async function seedRolesForOrg() {
  for (const roleName of seedRoleNames) {
    await AccessRole.findOrCreate({
      where: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        name: roleName,
      },
      defaults: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        name: roleName,
        description: `${roleName} role`,
        isSystem: true,
      },
    });
  }
}

async function seedSkillsForOrg() {
  for (const skill of seedSkills) {
    await Skill.findOrCreate({
      where: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        name: skill.name,
      },
      defaults: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        name: skill.name,
        category: skill.category,
        isActive: true,
      },
    });
  }
}

async function seedJobRolesForOrg() {
  const skills = await Skill.findAll({ where: { organizationId: DEFAULT_ORGANIZATION_ID } }) as any[];
  const skillsByName = new Map(skills.map((skill) => [skill.name, skill.id]));

  for (const jobRole of seedJobRoles) {
    const [savedRole] = await JobRole.findOrCreate({
      where: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        title: jobRole.title,
        level: jobRole.level,
      },
      defaults: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        title: jobRole.title,
        jobFamily: jobRole.jobFamily,
        level: jobRole.level,
        defaultExperienceMin: jobRole.defaultExperienceMin,
        defaultExperienceMax: jobRole.defaultExperienceMax,
        description: jobRole.description,
        isActive: true,
      },
    });

    const roleId = savedRole.get("id");
    const mappings = [
      ...jobRole.mustHave.map((name) => ({ name, isMandatory: true, weight: 1 })),
      ...jobRole.niceToHave.map((name) => ({ name, isMandatory: false, weight: 0.5 })),
    ];

    for (const mapping of mappings) {
      const skillId = skillsByName.get(mapping.name);
      if (!skillId) {
        continue;
      }

      await JobRoleSkill.findOrCreate({
        where: {
          organizationId: DEFAULT_ORGANIZATION_ID,
          jobRoleId: roleId,
          skillId,
        },
        defaults: {
          organizationId: DEFAULT_ORGANIZATION_ID,
          jobRoleId: roleId,
          skillId,
          weight: mapping.weight,
          isMandatory: mapping.isMandatory,
        },
      });
    }
  }
}

async function migrateLegacyUsersIfNeeded() {
  const tableMatches = await sequelize.query("SHOW TABLES LIKE 'users'", {
    type: QueryTypes.SELECT,
  }) as any[];

  if (!tableMatches.length) {
    return;
  }

  const legacyUsers = await sequelize.query(
    "SELECT id, first_name AS firstName, last_name AS lastName, email, role, is_active AS isActive, createdAt, updatedAt FROM users",
    { type: QueryTypes.SELECT }
  ) as any[];

  for (const legacyUser of legacyUsers) {
    const [employee] = await Employee.findOrCreate({
      where: { id: legacyUser.id },
      defaults: {
        id: legacyUser.id,
        organizationId: DEFAULT_ORGANIZATION_ID,
        firstName: legacyUser.firstName || "User",
        lastName: legacyUser.lastName || null,
        email: legacyUser.email,
        role: PRIMARY_ROLE_RANK.includes(legacyUser.role) ? legacyUser.role : "user",
        status: legacyUser.isActive === false ? "inactive" : "active",
        isActive: legacyUser.isActive !== false,      },
    });

    if (!employee.get("organizationId")) {
      employee.set("organizationId", DEFAULT_ORGANIZATION_ID);
      await employee.save();
    }
  }
}

async function ensureEmployeeRoleAssignments() {
  const roles = await AccessRole.findAll({ where: { organizationId: DEFAULT_ORGANIZATION_ID } }) as any[];
  const rolesByName = new Map(roles.map((role) => [role.get("name"), role.get("id")]));
  const employees = await Employee.findAll({ where: { organizationId: DEFAULT_ORGANIZATION_ID } }) as any[];

  for (const employee of employees) {
    const roleNames = new Set<string>();
    roleNames.add(employee.get("role") || "user");
    roleNames.add("employee");

    for (const roleName of roleNames) {
      const roleId = rolesByName.get(roleName);
      if (!roleId) {
        continue;
      }

      await EmployeeRole.findOrCreate({
        where: {
          organizationId: DEFAULT_ORGANIZATION_ID,
          userId: employee.get("id"),
          roleId,
          departmentId: null,
        },
        defaults: {
          organizationId: DEFAULT_ORGANIZATION_ID,
          userId: employee.get("id"),
          roleId,
          departmentId: null,
        },
      });
    }

    const assignments = await EmployeeRole.findAll({
      where: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        userId: employee.get("id"),
      },
      include: [{ model: AccessRole, as: "role" }],
    }) as any[];

    const assignedRoleNames = assignments
      .map((assignment) => assignment.role?.name)
      .filter(Boolean);

    employee.set("role", normalizePrimaryRole(assignedRoleNames));
    await employee.save();
  }
}

export async function seedInitialData() {
  await ensureOrganization();
  await seedDepartmentsForOrg();
  await seedLocationsForOrg();
  await seedRolesForOrg();
  await seedSkillsForOrg();
  await seedJobRolesForOrg();
  await migrateLegacyUsersIfNeeded();
  await ensureEmployeeRoleAssignments();
}

if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ force: false, alter: true });
      await seedInitialData();
      console.log("Initial data seeded successfully.");
      process.exit(0);
    } catch (error) {
      console.error("Failed to seed initial data:", error);
      process.exit(1);
    }
  })();
}


