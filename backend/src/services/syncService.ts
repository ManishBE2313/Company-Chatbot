import { getAccessToken } from "./auth";
import {getCalendarEvents,getWorkingHours } from "./graphService";
import {extractBusySlots,getFreeWindows,generateSlots} from "../utils/calenderUtils";
import {parseWorkingHours,getWorkingDaysFromCalendar} from "../utils/workingDays";
import {deleteAvailableSlots,bulkInsertSlots} from "../repositories/interviewerSlotRepository";

/*
 Syncs interview slots for a given interviewer.
 This function performs the complete workflow:
 1. Authenticates with Microsoft Graph API
 2. Fetches interviewer working hours
 3. Determines valid working days
 4. Fetches calendar events (busy slots)
 5. Computes free time windows
 6. Generates interview slots (30 mins)
 7. Updates slots in the database
 */

export async function syncInterviewerSlots(interviewer) {
  const token = await getAccessToken();

  const workingHours = await getWorkingHours(interviewer.email,token);

  const config = parseWorkingHours(workingHours);

  const days = getWorkingDaysFromCalendar(3, config);

  let allSlots = [];

  for (const day of days) {
       const events = await getCalendarEvents(interviewer.email,token,day.start.toISOString(),day.end.toISOString());

    const busy = extractBusySlots(events);
    const free = getFreeWindows(day.start, day.end, busy);
    const slots = generateSlots(free, 60);  // 60 minutes slots 

    allSlots.push(...slots);
  }

  await deleteAvailableSlots(interviewer.id);

  await bulkInsertSlots(
    allSlots.map((s) => ({
      interviewerId: interviewer.id,
      startTime: s.startTime,
      endTime: s.endTime,
      isBooked: false,
    }))
  );
}