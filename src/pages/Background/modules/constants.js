export const MAX_COUNT_PLANTS = 6;
export const DEFAULT_COUNT_WATER = 2;
export const STATUS_CAPTCHA = 556;
export const REWARD_DONE_STATUS = 'finish';

export const PlantType = {
  CHILD: 1,
  MOTHER: 2,
};

export const Tool = {
  POT: 1,
  WATER: 3,
  ANTI_CROW: 4,
};

export const PlantStage = {
  NEW: 'new',
  FARMING: 'farming',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
};

export const Duration = {
  PARSE_PLANTS: 300000,
  PARSE_WORLD_TREE: 3600000,
  APPLY_TOOL: 5000,
  RESOLVED_CAPTCHA: 60000,
};
