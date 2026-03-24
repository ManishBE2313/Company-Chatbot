import { Response, NextFunction } from "express";
import { Candidate, Interview, InterviewSlot, Job, JobApplication, Scorecard, User } from "../config/database";
import { UserRepository } from "../repositories/user";
import Errors from "../errors";

async function resolveUser(req: any) {
  const emailHeader = req.headers["x-user-email"];
  const userEmail = typeof emailHeader === "string" ? emailHeader.trim() : "";

  if (!userEmail) {
    throw new Errors.BadRequestError("x-user-email header is required.");
  }

  const user = await UserRepository.findByEmail(userEmail);
  if (!user) {
    throw new Errors.BadRequestError("User not found for the supplied x-user-email.");
  }

  return user;
}

export class InterviewController {
  public static async getMyInterviews(req: any, res: Response, next: NextFunction) {
    try {
      const user = await resolveUser(req);

      const interviews = await Interview.findAll({
        where: { interviewerId: user.id },
        include: [
          {
            model: InterviewSlot,
            as: "slot",
          },
          {
            model: Scorecard,
            as: "scorecard",
          },
          {
            model: User,
            as: "interviewer",
            attributes: ["id", "firstName", "lastName", "email", "role"],
          },
          {
            model: JobApplication,
            as: "application",
            include: [
              { model: Candidate, as: "candidate" },
              { model: Job, as: "job" },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({ data: interviews });
    } catch (error) {
      next(error);
    }
  }
}
