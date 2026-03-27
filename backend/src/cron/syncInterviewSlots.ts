import cron from "node-cron";
import { getAllActiveInterviewers } from "../repositories/interviewerRepository";
import { syncInterviewerSlots } from "../services/syncService";

/**
 * Initializes and starts the cron job responsible for syncing interview slots.
 *
 * This function schedules a recurring job that:
 * 1. Fetches all active interviewers from the database
 * 2. Retrieves their calendar data
 * 3. Generates available interview slots
 * 4. Stores the slots in the database
 * Currently runs every 1 minute (for testing purposes). After testing we will change it to 2 or 3 hour.
 */
export function startSlotSyncCron() {
      console.log(" Cron initialized");
  cron.schedule("*/2 * * * *", async () => {
    console.log("Running slot sync...");

    const interviewers = await getAllActiveInterviewers();

    for (const interviewer of interviewers) {
      await syncInterviewerSlots(interviewer);
    }
  });
}