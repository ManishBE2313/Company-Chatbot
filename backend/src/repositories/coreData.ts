export async function getAllCoreData(models: any) {
  const {
    job,
    jobApplication,
    candidate,
    interview,
    scorecard,
    user,
  } = models;

  const [
    jobs,
    applications,
    candidates,
    interviews,
    scorecards,
    users,
  ] = await Promise.all([
    job.findAll(),
    jobApplication.findAll(),
    candidate.findAll(),
    interview.findAll(),
    scorecard.findAll(),
    user.findAll(),
  ]);

  return {
    jobs,
    applications,
    candidates,
    interviews,
    scorecards,
    users,
  };
}