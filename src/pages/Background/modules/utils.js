export const sleep = async (fn, duration) => {
  await new Promise((resolve) => setTimeout(resolve, duration));
  return await fn();
};

export const getCost = (isMother, plantsCount) => {
  if (isMother) {
    return plantsCount * 150;
  }

  return plantsCount * 150 + 250;
};

export const getTimeout = (nextGroup) => Date.now() - new Date(nextGroup).getTime();
