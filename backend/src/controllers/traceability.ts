import { Response, NextFunction } from "express";
import {
  getCandidateTraceByJob,
  getJobTraceById,
} from "../repositories/traceability";

export async function getTraceabilityByJob(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    const models = req.models;

    const jobSummary = await getJobTraceById(models, jobId);
    const rows = await getCandidateTraceByJob(models, jobId);

    const grouped: any = {};

    rows.forEach((row: any) => {
      if (!grouped[row.applicationId]) {
        grouped[row.applicationId] = {
          candidateId: row.candidateId,
          candidateName: row.candidateName,
          status: row.status,
          currentStage: row.currentStage,
          interviews: [],
          _seen: new Set(), // ✅ track duplicates
        };
      }

      if (row.interviewId) {
        const key = `${row.interviewId}`;

        if (!grouped[row.applicationId]._seen.has(key)) {
          grouped[row.applicationId]._seen.add(key);

          grouped[row.applicationId].interviews.push({
            roundName: row.roundName,
            interviewerName: row.interviewerName,
            technicalScore: row.technicalScore,
            communicationScore: row.communicationScore,
            recommendation: row.recommendation,
          });
        }
      }
    });

    const candidates = Object.values(grouped).map((c: any) => {
      delete c._seen;
      return c;
    });

    return res.json({
      data: {
        jobSummary,
        candidates,
      },
      meta: {
        jobId,
        totalCandidates: candidates.length,
      },
    });
  } catch (error) {
    next(error);
  }
}