import { Response, NextFunction } from "express";
import { InterviewSlotService } from "../services/interviewSlot";
import { validateQueryParams, QueryValidationRules } from "../utils/validation";


export class InterviewSlotController {


 public static async createSlot(req: any, res: Response, next: NextFunction) {
   try {
     const validationRules: QueryValidationRules = {
       startTime: { type: "date", required: true },
       endTime: { type: "date", required: true },
     };


     validateQueryParams(req.body, validationRules);


     const userId = req.user?.id || "test-user-id";


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
     const userId = req.user?.id || "test-user-id";


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


     const userId = req.user?.id || "test-user-id";


     await InterviewSlotService.deleteSlot(
       req.params.id,
       userId
     );


     res.status(200).json({
       success: true,
       message: "Slot deleted successfully",
     });


   } catch (err) {
     next(err);
   }
 }
}
