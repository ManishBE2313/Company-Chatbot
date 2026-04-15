
import { InterviewSlotRepository } from "../repositories/interviewSlot";
import { User } from "../config/database";


export class InterviewSlotService {


 static async createSlot(
   interviewerId: string,
   startTime: Date,
   endTime: Date
 ) {
   const user = await User.findByPk(interviewerId);
   if (!user) {
     throw new Error("User not found");
   }
   if (user.role !== "interviewer"&& user.role !== "admin" && user.role !== "superadmin") {
     throw new Error("Unauthorized: Only users with the 'interviewer' role can create interview slots.");
   }

   if (startTime >= endTime) {
     throw new Error("Start time must be before end time");
   }


   const now = new Date();
   if (startTime < now) {
     throw new Error("Cannot create slot in the past");
   }


   // Check overlapping slots
   const overlap = await InterviewSlotRepository.findOverlappingSlot(
     interviewerId,
     startTime,
     endTime
   );


   if (overlap) {
     throw new Error("Slot overlaps with existing slot");
   }


   return await InterviewSlotRepository.createSlot({
     interviewerId,
     startTime,
     endTime,
   });
 }
 static async getMySlots(interviewerId: string) {
   const user = await User.findByPk(interviewerId);
   if (!user) {
     throw new Error("User not found");
   }


   return await InterviewSlotRepository.getSlotsByInterviewer(interviewerId);
 }


 static async deleteSlot(slotId: string, interviewerId: string) {


   const user = await User.findByPk(interviewerId);
   if (!user) {
     throw new Error("User not found");
   }
  
   const slot = await InterviewSlotRepository.findSlotByIdAndInterviewer(
     slotId,
     interviewerId
   );


   if (!slot) {
     throw new Error("Slot not found");
   }


   // 3. Prevent deleting booked slot
   const isBooked =
     typeof slot.get === "function"
       ? slot.get("isBooked")
       : slot.isBooked;


   if (isBooked) {
     throw new Error("Cannot delete a booked slot");
   }


   // 4. Delete slot
   await InterviewSlotRepository.deleteSlot(slot);
 }
}
