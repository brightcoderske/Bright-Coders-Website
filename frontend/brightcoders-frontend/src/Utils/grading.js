export const getGradeBand = (score = 0) => {
  const value = Number(score) || 0;
  if (value <= 40) return "Approaching expectation";
  if (value <= 60) return "Meets expectation";
  if (value <= 80) return "Above expectation";
  return "Exceeding expectation";
};
