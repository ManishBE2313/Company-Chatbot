import { Response, NextFunction } from "express";
import { InterviewSlotService } from "../services/interviewSlot";
import { validateQueryParams, QueryValidationRules } from "../utils/validation";
import { UserRepository } from "../repositories/user";
import Errors from "../errors";

async function resolveUserId(req: any) {
  const emailHeader = req.headers["x-user-email"];
  const userEmail = typeof emailHeader === "string" ? emailHeader.trim() : "";

  if (!userEmail) {
    throw new Errors.BadRequestError("x-user-email header is required.");
  }

  const user = await UserRepository.findByEmail(userEmail);
  if (!user) {
    throw new Errors.BadRequestError("User not found for the supplied x-user-email.");
  }

  return user.id;
}

export class InterviewSlotController {
  public static async createSlot(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        startTime: { type: "date", required: true },
        endTime: { type: "date", required: true },
      };

      validateQueryParams(req.body, validationRules);

      const userId = await resolveUserId(req);

      const slot = await InterviewSlotService.createSlot(
        userId,
        req.body.startTime,
        req.body.endTime
      );

      res.status(201).json({
        success: true,
        data: slot,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getMySlots(req: any, res: Response, next: NextFunction) {
    try {
      const userId = await resolveUserId(req);
      const slots = await InterviewSlotService.getMySlots(userId);

      res.status(200).json({
        success: true,
        data: slots,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteSlot(req: any, res: Response, next: NextFunction) {
    try {
      const validationRules: QueryValidationRules = {
        id: { type: "uuid", required: true },
      };

      validateQueryParams(req.params, validationRules);

      const userId = await resolveUserId(req);

      await InterviewSlotService.deleteSlot(req.params.id, userId);

      res.status(200).json({
        success: true,
        message: "Slot deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}
