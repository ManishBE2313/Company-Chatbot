// controllers/notification.ts
import { Response, NextFunction } from "express";
import { NotificationService } from "../services/notification";

export class NotificationController {

  // Interview Scheduled
  public static async sendInterviewScheduled(req: any, res: Response, next: NextFunction) {
    try {
      const { email, name, date } = req.body;

      await NotificationService.sendInterviewScheduled(email, name, date);

      res.status(200).json({
        message: "Interview scheduled email sent",
      });
    } catch (error) {
      next(error);
    }
  }

  //  Reschedule
  public static async sendReschedule(req: any, res: Response, next: NextFunction) {
    try {
      const { email, name } = req.body;

      await NotificationService.sendRescheduleRequest(email, name);

      res.status(200).json({
        message: "Reschedule email sent",
      });
    } catch (error) {
      next(error);
    }
  }

  //  Scorecard Reminder
  public static async sendScorecardReminder(req: any, res: Response, next: NextFunction) {
    try {
      const { email, name } = req.body;

      await NotificationService.sendScorecardReminder(email, name);

      res.status(200).json({
        message: "Scorecard reminder sent",
      });
    } catch (error) {
      next(error);
    }
  }
  // NEW: SharePoint Grant Request
  public static async sendSharepointGrantRequest(req: any, res: Response, next: NextFunction) {
    try {
      const { email, folderUrl, clientId, encodedUrl } = req.body;

      if (!email || !folderUrl || !clientId || !encodedUrl) {
        return res.status(400).json({ message: "Missing required fields: email, folderUrl, clientId, encodedUrl" });
      }

      await NotificationService.sendSharepointGrantRequest(email, folderUrl, clientId, encodedUrl);

      res.status(200).json({
        message: "SharePoint grant request email sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}