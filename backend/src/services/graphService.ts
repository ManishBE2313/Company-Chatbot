import axios from "axios";
/**
 Fetches calendar events (meetings) for a user within a given time range.

 This function:
 - Calls Microsoft Graph API `/calendarView`
 - Retrieves all events between start and end time
 - Returns raw event data (used to determine busy slots)
 */
export async function getCalendarEvents(email, token, start, end) {
  const res = await axios.get(
    `https://graph.microsoft.com/v1.0/users/${email}/calendarView`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { startDateTime: start, endDateTime: end },
    }
  );

  return res.data.value;
}
/*
 Fetches working hours configuration for a user.
 This function:
 - Calls Microsoft Graph API `/mailboxSettings`
 - Retrieves working days and working hours
 */

export async function getWorkingHours(email, token) {
  const res = await axios.get(
    `https://graph.microsoft.com/v1.0/users/${email}/mailboxSettings`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data.workingHours;
}   