export const sleep = async (fn, duration) => {
  await new Promise((resolve) => setTimeout(resolve, duration));
  return await fn();
};

export const getTimeout = (nextGroup) => Date.now() - new Date(nextGroup).getTime();
