import { models } from "../config/database";
import {upsertCandidateTrace,upsertJobTrace,} from "../repositories/traceability";

export async function updateTraceForApplication(applicationId: string) {
  const {
    jobApplication,
    candidate,
    interview,
    scorecard,
    user,
  } = models;

  const app = await jobApplication.findByPk(applicationId);
  if (!app) return;

  const jobId = app.jobId;

  const candidateData = await candidate.findByPk(app.candidateId);

  const interviews = await interview.findAll({
    where: { applicationId },
  });

  const users = await user.findAll();
  const userMap = new Map(
    users.map((u: any) => [u.id, `${u.firstName} ${u.lastName}`])
  );

  if (interviews.length > 0) {
    for (const i of interviews) {
      const score = await scorecard.findOne({
        where: { interviewId: i.id },
      });

      await upsertCandidateTrace(models, {
        jobId,
        applicationId,
        interviewId: i.id,
        candidateId: app.candidateId,
        candidateName: `${candidateData?.firstName} ${candidateData?.lastName}`,
        currentStage: app.currentStage,
        interviewerId: i.interviewerId,
        interviewerName: userMap.get(i.interviewerId) || null,
        roundName: i.roundName,
        technicalScore: score?.technicalScore ?? null,
        communicationScore: score?.communicationScore ?? null,
        recommendation: score?.recommendation ?? null,
        status: app.status,
        lastUpdatedAt: new Date(),
      });
    }
  } else {
    await upsertCandidateTrace(models, {
      jobId,
      applicationId,
      interviewId: null,
      candidateId: app.candidateId,
      candidateName: `${candidateData?.firstName} ${candidateData?.lastName}`,
      currentStage: app.currentStage,
      status: app.status,
      lastUpdatedAt: new Date(),
    });
  }

  const totalCandidates = await jobApplication.count({ where: { jobId } });

  const selectedCount = await jobApplication.count({
    where: { jobId, status: "OFFERED" },
  });

  const rejectedCount = await jobApplication.count({
    where: { jobId, status: "REJECTED" },
  });

  await upsertJobTrace(models, {
    jobId,
    totalCandidates,
    selectedCount,
    rejectedCount,
    inProgressCount: totalCandidates - selectedCount - rejectedCount,
    lastUpdatedAt: new Date(),
  });
}