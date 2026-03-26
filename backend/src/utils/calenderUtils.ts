import { toIST } from "./time";
/*
  Converts raw calendar events into busy time intervals.
  This function:
  Takes events fetched from Microsoft Graph API
   - Extracts start and end times
   - Converts them into IST timezone
   Output: Array of busy time ranges
 */
export function extractBusySlots(events) {
  return events.map((e) => ({
    start: toIST(e.start.dateTime).toDate(),
    end: toIST(e.end.dateTime).toDate(),
  }));
}

/*
  Computes free time windows by removing busy slots from working hours.
   This function:
   - Takes full working hours (e.g., 11 AM – 11 PM)
   - Subtracts all busy intervals (meetings)
   - Returns remaining free time windows
 */
export function getFreeWindows(workingStart, workingEnd, busySlots) {
  const free = [];
  let current = new Date(workingStart);

  const sorted = busySlots.sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  for (const busy of sorted) {
    if (current < busy.start) {
      free.push({ start: current, end: busy.start });
    }

    current = new Date(Math.max(current.getTime(), busy.end.getTime()));
  }

  if (current < workingEnd) {
    free.push({ start: current, end: workingEnd });
  }
  return free;
}

/*
   Splits free time windows into fixed-duration interview slots.
   This function:
   - Takes free windows (e.g., 11–15)
   - Divides them into slots of given duration (e.g., 30 minutes)
 */
export function generateSlots(freeWindows, duration) {
  const slots = [];

  for (const window of freeWindows) {
    let start = new Date(window.start);

    while (
      start.getTime() + duration * 60000 <= window.end.getTime()
    ) {
      const end = new Date(start.getTime() + duration * 60000);

      slots.push({ startTime: start, endTime: end });

      start = end;
    }
  }

  return slots;
}