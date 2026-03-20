export const calculatePriority = (
  baseScore: number,
  isReferral: boolean,
  isInternal: boolean
): number => {
  let priorityScore = baseScore;

  if (isReferral) {
    priorityScore += 5;
  }

  if (isInternal) {
    priorityScore += 10;
  }

  return priorityScore;
};