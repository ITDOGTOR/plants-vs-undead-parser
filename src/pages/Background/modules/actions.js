import ApiService from './api';
import {sleep} from './utils';
import {
  DEFAULT_COUNT_WATER,
  Duration,
  MAX_COUNT_PLANTS,
  PlantStage,
  PlantType,
  REWARD_DONE_STATUS,
  STATUS_CAPTCHA,
  Tool,
} from './constants';

const apiService = new ApiService();

export const sendMessageNoToken = () => chrome.runtime.sendMessage({'message': 'failed_token'});
export const sendMessageIsToken = (token) => {
  apiService.setAuthToken(token);
  chrome.runtime.sendMessage({message: 'success_token'});
};

export const parseWorldTree = async () => {
  const {data: {rewardAvailable, yesterdayReward, reward}} = await apiService.getWorldTree();

  yesterdayReward && await apiService.claimYesterdayRewards();
  !rewardAvailable && await apiService.waterWorldTree();

  const availableRewards = reward.filter(({status}) => status === REWARD_DONE_STATUS);

  for (const {type} of availableRewards) {
    await apiService.claimReward(type);
  }
};

export const parsePlants = async () => {
  const {data} = await apiService.getFarms();

  const isMother = data.some(({plantType}) => plantType === PlantType.MOTHER);
  const plantsCount = data.length;

  if (plantsCount !== MAX_COUNT_PLANTS) {
    !isMother && await sowPlant(PlantType.MOTHER);

    for (const item of Array.from(Array(MAX_COUNT_PLANTS - plantsCount), (val, idx) => idx)) {
      await sowPlant(PlantType.CHILD);
    }
    return;
  }

  const {paused, cancelled, lackWater} = getPlantsCategory(data);

  for (const {_id: plantId} of paused) {
    await sleep(() => applyToolPlant(plantId, Tool.ANTI_CROW), Duration.APPLY_TOOL);
  }

  for (const {_id: plantId} of cancelled) {
    await apiService.harvestPlant(plantId);
    await apiService.deletePlant(plantId);
  }

  for (const {countWater, _id: plantId} of lackWater) {
    for (const value of Array.from(Array(DEFAULT_COUNT_WATER - countWater), (val, idx) => idx)) {
      await sleep(() => applyToolPlant(plantId, Tool.WATER), Duration.APPLY_TOOL);
    }
  }
};

export const getFarmStatus = async () => {
  return await apiService.getFarmStatus();
};

const sowPlant = async (plantType) => {
  const {usages} = await getSunflower(plantType);

  if (!usages) {
    await apiService.buySunflower(plantType);
  }

  const {data: {_id: plantId}} = await apiService.plantInGround(plantType);
  await sleep(() => applyToolPlant(plantId, Tool.POT), Duration.APPLY_TOOL);
  await sleep(() => applyToolPlant(plantId, Tool.WATER), Duration.APPLY_TOOL);
  await sleep(() => applyToolPlant(plantId, Tool.WATER), Duration.APPLY_TOOL);
};

const applyToolPlant = async (plantId, toolId) => {
  const {usages} = await getTool(toolId);

  if (!usages) {
    await apiService.buyTool(toolId);
  }

  const {status} = await apiService.plantCare({farmId: plantId, toolId});

  if (status === STATUS_CAPTCHA) {
    const {data: {gt, challenge}} = await apiService.registerCaptcha();
    const {request: idCaptcha} = await apiService.sendCaptcha({gt, challenge});

    const {request} = await sleep(() => apiService.getResolvedCaptcha(idCaptcha), Duration.RESOLVED_CAPTCHA);

    if (typeof request === 'string') {
      return;
    }

    await apiService.validateCaptcha(request);
    await apiService.plantCare({farmId: plantId, toolId});
  }
};

const getSunflower = async (currentPlantType) => {
  const {data} = await apiService.getMySunflowers();

  return data.reduce((acc, cur) => {
    const {plantType} = cur;
    return plantType === currentPlantType ? {...acc, ...cur} : acc;
  }, {});
};

const getTool = async (currentToolId) => {
  const {data} = await apiService.getMyTools();

  return data.reduce((acc, cur) => {
    const {toolId} = cur;
    return toolId === currentToolId ? {...acc, ...cur} : acc;
  }, {});
};

const getPlantsCategory = (plants) => {
  return plants.reduce((acc, cur) => {
    const {stage, activeTools} = cur;
    const currentCountWater = activeTools.filter(({type}) => type === 'WATER')[0]?.count || 0;

    if (stage === PlantStage.CANCELLED) {
      acc.cancelled.push(cur);
      return acc;
    }

    if (currentCountWater < DEFAULT_COUNT_WATER) {
      acc.lackWater.push({...cur, countWater: currentCountWater});
      return acc;
    }

    if (stage === PlantStage.PAUSED) {
      acc.paused.push(cur);
      return acc;
    }

    return acc;
  }, {paused: [], cancelled: [], lackWater: []});
};
