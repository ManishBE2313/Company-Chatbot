import axios from "axios";
import Errors from "../errors";
import { SettingsRepository } from "../repositories/settings";

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8001";

export class SettingsService {
  public static async listSkills() {
    return SettingsRepository.listSkills();
  }

  public static async createSkill(payload: { name: string; category: string }) {
    const name = payload.name.trim();
    const category = payload.category.trim() || "custom";

    if (!name) {
      throw new Errors.BadRequestError("Skill name is required.");
    }

    const existing = await SettingsRepository.findSkillByName(name);
    if (existing) {
      return existing;
    }

    return SettingsRepository.createSkill({ name, category, isActive: true });
  }

  public static async listJobDescriptionTemplates() {
    const [templates, skills] = await Promise.all([
      SettingsRepository.listJobDescriptionTemplates(),
      SettingsRepository.listSkills(),
    ]);

    const skillMap = new Map(skills.map((skill: any) => [skill.id, skill]));

    return templates.map((template: any) => ({
      ...template.toJSON(),
      mustHaveSkills: (template.mustHaveSkillIds || []).map((id: string) => skillMap.get(id)).filter(Boolean),
      niceToHaveSkills: (template.niceToHaveSkillIds || []).map((id: string) => skillMap.get(id)).filter(Boolean),
    }));
  }

  public static async analyzeJobDescription(payload: {
    title: string;
    description: string;
  }) {
    const skills = await SettingsRepository.listSkills();
    const response = await axios.post(`${FASTAPI_BASE_URL}/api/hr/settings/job-descriptions/analyze`, {
      ...payload,
      availableSkills: skills.map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
      })),
    });

    return response.data;
  }

  public static async suggestText(payload: { input: string; kind?: "skill" | "description" }) {
    const response = await axios.post(`${FASTAPI_BASE_URL}/api/hr/settings/suggest`, payload);
    return response.data;
  }

  public static async createJobDescriptionTemplate(payload: {
    title: string;
    jobRoleId?: string | null;
    description: string;
    refinedDescription?: string | null;
    mustHaveSkillIds?: string[];
    niceToHaveSkillIds?: string[];
  }) {
    if (!payload.title?.trim()) {
      throw new Errors.BadRequestError("Template title is required.");
    }

    if (!payload.description?.trim()) {
      throw new Errors.BadRequestError("Job description is required.");
    }

    if (payload.jobRoleId) {
      const jobRole = await SettingsRepository.findJobRoleById(payload.jobRoleId);
      if (!jobRole) {
        throw new Errors.BadRequestError("Job role not found.");
      }
    }

    return SettingsRepository.createJobDescriptionTemplate({
      title: payload.title.trim(),
      jobRoleId: payload.jobRoleId || null,
      description: payload.description.trim(),
      refinedDescription: payload.refinedDescription?.trim() || null,
      mustHaveSkillIds: payload.mustHaveSkillIds || [],
      niceToHaveSkillIds: payload.niceToHaveSkillIds || [],
    });
  }
}

