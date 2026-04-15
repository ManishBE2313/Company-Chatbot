import { Request, Response } from "express";
import { JobService } from "../services/job";
import { UserRepository } from "../repositories/user";

// Extend the Express Request interface so TypeScript knows about the 'user' object
interface AuthRequest extends Request {
  user?: {
    id: string;
    organizationId: string;
    [key: string]: any;
  };
}

export const createDraftJob = async (req: AuthRequest, res: Response) => {
  try {
    const { title, department, requirements, level } = req.body;

    const actingUserEmail = typeof req.headers["x-user-email"] === "string"
      ? req.headers["x-user-email"].trim()
      : null;
    const actingUser = actingUserEmail
      ? await UserRepository.findByEmail(actingUserEmail)
      : null;
    const organizationId = req.user?.organizationId || actingUser?.organizationId;
    const createdById = req.user?.id || actingUser?.id;

    // 1. Authorization Validation
    if (!createdById) {
      return res.status(401).json({ error: "Unauthorized access. User ID missing." });
    }

    // 2. Input Validation
    if (!title || !requirements) {
      return res.status(400).json({ error: "Title and requirements are strictly required." });
    }

    // 3. Delegate business logic to the Service Layer
    const result = await JobService.processDraftJobEvaluation({
      title,
      department,
      level,
      requirements,
      organizationId: organizationId as string,
      createdById: createdById as string,
    });

    // 4. Return formatted response to the frontend
    return res.status(201).json({
      message: result.aiEvaluation.isApproved 
        ? "Job created and approved successfully." 
        : "Job saved as draft. HR review required due to low AI confidence score.",
      job: result.job,
      aiFeedback: {
        score: result.aiEvaluation.confidenceScore,
        mismatchedSkills: result.aiEvaluation.mismatchedSkills,
        warnings: result.aiEvaluation.warnings,
      },
    });

  } catch (error) {
    console.error("[Draft Job Controller Error]:", error);
    return res.status(500).json({ error: "Internal server error creating draft job." });
  }
};
