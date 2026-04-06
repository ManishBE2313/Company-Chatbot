import { eventBus } from "./eventBus";
import { EVENTS } from "./events";
import { updateTraceForApplication } from "../services/traceability";

export function startTraceabilityConsumer() {

  eventBus.on(EVENTS.INTERVIEW_CREATED, async ({ applicationId }) => {
    try {
      console.log("🔥 EVENT RECEIVED: INTERVIEW_CREATED", applicationId);

      await updateTraceForApplication(applicationId);

      console.log("TRACE UPDATED (INTERVIEW):", applicationId);
    } catch (err) {
      console.error("ERROR in INTERVIEW_CREATED:", err);
    }
  });

  eventBus.on(EVENTS.SCORE_ADDED, async ({ applicationId }) => {
    try {
      console.log(" EVENT RECEIVED: SCORE_ADDED", applicationId);

      if (!applicationId) {
        console.warn("⚠️ Missing applicationId in SCORE_ADDED");
        return;
      }

      await updateTraceForApplication(applicationId);

      console.log("TRACE UPDATED (SCORE):", applicationId);
    } catch (err) {
      console.error("ERROR in SCORE_ADDED:", err);
    }
  });

  eventBus.on(EVENTS.APPLICATION_UPDATED, async ({ applicationId }) => {
    try {
      console.log("EVENT RECEIVED: APPLICATION_UPDATED", applicationId);

      await updateTraceForApplication(applicationId);

      console.log("TRACE UPDATED (APPLICATION):", applicationId);
    } catch (err) {
      console.error("ERROR in APPLICATION_UPDATED:", err);
    }
  });

}