import { DEFAULT_ORGANIZATION_ID } from "../constants/system";
import { JobDescriptionTemplate, JobRole, Skill } from "../config/database";

export class SettingsRepository {
  public static async listSkills() {
    return Skill.findAll({
      where: { organizationId: DEFAULT_ORGANIZATION_ID },
      order: [["category", "ASC"], ["name", "ASC"]],
    });
  }

  public static async findSkillByName(name: string) {
    return Skill.findOne({
      where: { organizationId: DEFAULT_ORGANIZATION_ID, name },
    });
  }

  public static async createSkill(payload: { name: string; category: string; isActive?: boolean }) {
    return Skill.create({
      organizationId: DEFAULT_ORGANIZATION_ID,
      name: payload.name,
      category: payload.category,
      isActive: payload.isActive ?? true,
    });
  }

  public static async findSkillsByIds(skillIds: string[]) {
    return Skill.findAll({
      where: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        id: skillIds,
      },
      order: [["name", "ASC"]],
    });
  }

  public static async listJobDescriptionTemplates() {
    return JobDescriptionTemplate.findAll({
      where: { organizationId: DEFAULT_ORGANIZATION_ID, isActive: true },
      include: [{ model: JobRole, as: "jobRole" }],
      order: [["createdAt", "DESC"]],
    });
  }

  public static async createJobDescriptionTemplate(payload: {
    title: string;
    jobRoleId?: string | null;
    description: string;
    refinedDescription?: string | null;
    mustHaveSkillIds?: string[];
    niceToHaveSkillIds?: string[];
  }) {
    return JobDescriptionTemplate.create({
      organizationId: DEFAULT_ORGANIZATION_ID,
      title: payload.title,
      jobRoleId: payload.jobRoleId || null,
      description: payload.description,
      refinedDescription: payload.refinedDescription || null,
      mustHaveSkillIds: payload.mustHaveSkillIds || [],
      niceToHaveSkillIds: payload.niceToHaveSkillIds || [],
      isActive: true,
    });
  }

  public static async findJobRoleById(jobRoleId: string) {
    return JobRole.findByPk(jobRoleId);
  }
}
