import { InterviewSlot } from "../config/database";

export async function deleteAvailableSlots(interviewerId: string) {
  await InterviewSlot.destroy({
    where: {
      interviewerId,
      isBooked: false,
    },
  });
}

export async function bulkInsertSlots(slots: any[]) {
  await InterviewSlot.bulkCreate(slots);
}