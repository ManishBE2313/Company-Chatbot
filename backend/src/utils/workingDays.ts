import { nowIST } from "./time";

/*
 Parses working hours received from Microsoft Graph API.
 This function:
 - Extracts start and end hours from time strings (e.g., "09:00:00")
 - Converts them into numeric hours (e.g., 9, 18)
 - Normalizes working days to lowercase for comparison

 */
export function parseWorkingHours(wh) {
  return {
    startHour: parseInt(wh.startTime.split(":")[0]),
    endHour: parseInt(wh.endTime.split(":")[0]),
    workingDays: wh.daysOfWeek.map((d) => d.toLowerCase()),
  };
}

/*
Generates upcoming working days based on calendar configuration.
This function:
  - Iterates over upcoming days starting from today (IST)
  - Filters only valid working days (e.g., Mon–Fri)
  - Assigns start and end time for each valid day
 */
export function getWorkingDaysFromCalendar(numDays, config) {
  const days = [];
  let added = 0;
  let i = 0;
  
  while (added < numDays) {
    const day = nowIST().add(i, "day");

    const name = day.format("dddd").toLowerCase();

    if (config.workingDays.includes(name)) {
      days.push({
        start: day.hour(config.startHour).toDate(),
        end: day.hour(config.endHour).toDate(),
      });

      added++;
    }

    i++;
  }

  return days;
}