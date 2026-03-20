import { Op } from "sequelize";
import { InterviewSlot } from "../config/database";


export class InterviewSlotRepository {


 static async findOverlappingSlot(
   interviewerId: string,
   startTime: Date,
   endTime: Date
 ) {
   return await InterviewSlot.findOne({
     where: {
       interviewerId,
       [Op.and]: [
         { startTime: { [Op.lt]: endTime } },
         { endTime: { [Op.gt]: startTime } },
       ],
     },
   });
 }


 static async createSlot(data: {
   interviewerId: string;
   startTime: Date;
   endTime: Date;
 }) {
   return await InterviewSlot.create(data);
 }


 static async getSlotsByInterviewer(interviewerId: string) {
   return await InterviewSlot.findAll({
     where: { interviewerId },
     order: [["startTime", "ASC"]],
   });
 }


 static async findSlotByIdAndInterviewer(
   slotId: string,
   interviewerId: string
 ) {
   return await InterviewSlot.findOne({
     where: {
       id: slotId,
       interviewerId,
     },
   });
 }


 static async deleteSlot(slot: any) {
   return await slot.destroy();
 }
}
