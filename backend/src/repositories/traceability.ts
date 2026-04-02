export async function upsertCandidateTrace(models: any, data: any) {
  return models.candidateTrace.upsert(data);
}

export async function upsertJobTrace(models: any, data: any) {
  return models.jobTraceability.upsert(data);
}

export async function getCandidateTraceByJob(models: any, jobId: string) {
  return models.candidateTrace.findAll({ where: { jobId } });
}

export async function getJobTraceById(models: any, jobId: string) {
  return models.jobTraceability.findOne({ where: { jobId } });
}