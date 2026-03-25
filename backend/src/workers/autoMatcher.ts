import { Op, Transaction } from "sequelize";
import {
  Candidate,
  Interview,
  InterviewSlot,
  Job,
  JobApplication,
  User, 
  getTransaction,
} from "../config/database";
import { PipelineService } from "../services/pipeline";
import { NotificationService } from "../services/notification";

const DEFAULT_SCHEDULER_INTERVAL_MS = 30000;
let schedulerTimer: NodeJS.Timeout | undefined;
let isSchedulerRunning = false;

const toInterval = (value: string | undefined) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SCHEDULER_INTERVAL_MS;
};

const getStageName = (application: any) => {
  if (application.currentStage) {
    return application.currentStage;
  }

  const pipelineConfig = Array.isArray(application.job?.pipelineConfig)
    ? application.job.pipelineConfig
    : [];

  const firstStage = pipelineConfig.find((stage: any) => stage?.name || stage?.roundName || stage?.title);
  return firstStage?.name || firstStage?.roundName || firstStage?.title || "Interview Round";
};

async function findAvailableSlot(transaction: Transaction, allowedInterviewerIds: string[]) {
  if (!allowedInterviewerIds || allowedInterviewerIds.length === 0) {
    return null;
  }

  return InterviewSlot.findOne({
    where: {
      isBooked: false,
      startTime: {
        [Op.gte]: new Date(),
      },
      interviewerId: {
        [Op.in]: allowedInterviewerIds,
      },
    },
    order: [["startTime", "ASC"]],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
}

async function tryScheduleCandidate(application: any) {
  let transaction: Transaction | undefined;

  try {
    transaction = await getTransaction();

    const freshApplication = (await JobApplication.findByPk(application.id, {
      include: [
        { model: Job, as: "job" },
        { model: Candidate, as: "candidate" },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    })) as any;

    if (!freshApplication || freshApplication.status !== "SCHEDULING") {
      await transaction.rollback();
      return false;
    }

    const existingInterview = await Interview.findOne({
      where: {
        applicationId: freshApplication.id,
        status: "SCHEDULED",
      },
      transaction,
    });

    if (existingInterview) {
      await transaction.commit();
      await PipelineService.transitionState(
        freshApplication.id,
        "SCHEDULED",
        null,
        "Recovered existing scheduled interview during auto-match."
      );
      return true;
    }

    const currentStageName = getStageName(freshApplication);
    
    const pipelineConfig = Array.isArray(freshApplication.job?.pipelineConfig)
      ? freshApplication.job.pipelineConfig
      : [];
      
    let currentStageConfig = pipelineConfig.find((stage: any) => 
      stage?.name === currentStageName || stage?.roundName === currentStageName || stage?.title === currentStageName
    );

    // NEW: Fallback to the first stage if the candidate is stuck on a generic name
    if (!currentStageConfig && pipelineConfig.length > 0) {
      currentStageConfig = pipelineConfig[0];
    }
    
    let allowedInterviewerIds = currentStageConfig?.interviewerIds || [];
    const allowedInterviewerEmails = currentStageConfig?.interviewerEmails || [];

    // NEW: If IDs are missing but we have emails, look up the IDs in the database
    if (allowedInterviewerIds.length === 0 && allowedInterviewerEmails.length > 0) {
      const users = await User.findAll({
        where: { email: { [Op.in]: allowedInterviewerEmails } },
        attributes: ["id"],
        transaction
      }) as any;
      allowedInterviewerIds = users.map((u: any) => u.id);
    }

    console.log("\n--- AUTO MATCHER DEBUG ---");
    console.log("Candidate App ID:", freshApplication.id);
    console.log("Target Stage:", currentStageConfig?.name || "None");
    console.log("Resolved IDs Array:", allowedInterviewerIds);
    console.log("--------------------------\n");

    const availableSlot = await findAvailableSlot(transaction, allowedInterviewerIds);
    
    if (!availableSlot) {
      await transaction.rollback();
      return false; 
    }

    await availableSlot.update({ isBooked: true }, { transaction });

    // Use the exact stage name from the config
    const finalRoundName = currentStageConfig?.name || currentStageName;

    await Interview.create(
      {
        applicationId: freshApplication.id,
        interviewerId: availableSlot.interviewerId,
        slotId: availableSlot.id,
        roundName: finalRoundName,
        status: "SCHEDULED",
      },
      { transaction }
    );

    await transaction.commit();

    await PipelineService.transitionState(
      freshApplication.id,
      "SCHEDULED",
      null,
      `Auto-Scheduled with Interviewer ${availableSlot.interviewerId} for ${finalRoundName}`
    );

    const candidateFirstName = freshApplication.candidate?.firstName || "Candidate";
    const candidateEmail = freshApplication.candidate?.email;

    if (candidateEmail) {
      await NotificationService.sendInterviewScheduled(
        candidateEmail,
        candidateFirstName,
        availableSlot.startTime.toLocaleString()
      );
    }

    console.log(`Successfully scheduled candidate ${freshApplication.id}.`);
    return true;
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error(`Failed to schedule candidate ${application.id}:`, error);
    return false;
  }
}

export async function runScheduler() {
  if (isSchedulerRunning) {
    return;
  }

  isSchedulerRunning = true;

  try {
    const pendingCandidates = await JobApplication.findAll({
      where: { status: "SCHEDULING" },
      order: [
        ["priorityScore", "DESC"],
        ["createdAt", "ASC"],
      ],
      include: [
        { model: Job, as: "job" },
        { model: Candidate, as: "candidate" },
      ],
    });

    for (const application of pendingCandidates) {
      const scheduled = await tryScheduleCandidate(application);
      if (!scheduled) {
        break;
      }
    }
  } finally {
    isSchedulerRunning = false;
  }
}

export function startAutoMatcher() {
  if (schedulerTimer) {
    return schedulerTimer;
  }

  const intervalMs = toInterval(process.env.AUTO_MATCHER_INTERVAL_MS);

  void runScheduler().catch((error) => {
    console.error("Initial auto-matcher run failed:", error);
  });

  schedulerTimer = setInterval(() => {
    void runScheduler().catch((error) => {
      console.error("Auto-matcher run failed:", error);
    });
  }, intervalMs);

  return schedulerTimer;
}