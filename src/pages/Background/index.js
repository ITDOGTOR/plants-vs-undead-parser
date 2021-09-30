const MAX_COUNT_PLANTS = 6;
const DEFAULT_COUNT_WATER = 2;
const PlantType = {
  CHILD: 1,
  MOTHER: 2,
};
const Tool = {
  POT: 1,
  WATER: 3,
  ANTI_CROW: 4,
};
const PlantStage = {
  FARMING: 'farming',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
};
const RewardStatus = {
  FINISH: 'finish',
};
const Duration = {
  PARSE_PLANTS: 180000,
  PARSE_WORLD_TREE: 3600000,
  APPLY_TOOL: 5000,
  RESOLVED_CAPTCHA: 90000,
};
const Status = {
  CAPTCHA: 556,
};

const api = {
  mainUrl: 'https://backend-farm.plantvsundead.com',

  get authToken() {
    return this._authToken;
  },
  set authToken(value) {
    this._authToken = value;
  },

  getFarmStatus() {
    return fetch(`${this.mainUrl}/farm-status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
    });
  },
  getFarms() {
    return fetch(`${this.mainUrl}/farms`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
    });
  },
  sowPlant(data) {
    return fetch(`${this.mainUrl}/farms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify({landId: 0, sunflowerId: data}),
    });
  },
  harvestPlant(plantId) {
    return fetch(`${this.mainUrl}/farms/${plantId}/harvest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify({}),
    });
  },
  deletePlant(plantId) {
    return fetch(`${this.mainUrl}/farms/${plantId}/deactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify({}),
    });
  },
  applyTool(data) {
    return fetch(`${this.mainUrl}/farms/apply-tool`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify({
        ...data,
        token: {
          challenge: 'default',
          seccode: 'default',
          validate: 'default',
        },
      }),
    });
  },
  getWorldTreeData() {
    return fetch(`${this.mainUrl}/world-tree/datas`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
    });
  },
  claimReward(data) {
    return fetch(`${this.mainUrl}/world-tree/claim-reward`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify({type: data}),
    });
  },
  giveWaters() {
    return fetch(`${this.mainUrl}/world-tree/give-waters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify({amount: 20}),
    });
  },
  registerCaptcha() {
    return fetch(`${this.mainUrl}/captcha/register`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
    });
  },
  validateCaptcha(data) {
    return fetch(`${this.mainUrl}/captcha/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(data),
    });
  },

  sendCaptcha(data) {
    return fetch('http://rucaptcha.com/in.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        key: '488747193466abefc5776074397b9dd7',
        method: 'geetest',
        pageurl: 'https://marketplace.plantvsundead.com/#/farm/',
        json: 1,
      }),
    });
  },
  getResolvedCaptcha(idCaptcha) {
    return fetch(`http://rucaptcha.com/res.php?key=488747193466abefc5776074397b9dd7&action=get&json=1&id=${idCaptcha}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
  },
};

let timerGetFarmStatus = 0;
let timerParseWorldTree = 0;
let timerParsePlants = 0;

const getTimeout = (nextGroup) => Date.now() - new Date(nextGroup).getTime();
const sleep = async (fn, duration) => {
  await new Promise((resolve) => setTimeout(resolve, duration));
  await fn();
};

const getFarmStatus = async () => {
  const res = await api.getFarmStatus();
  const {data} = await res.json();

  if (data.nextGroup) {
    timerGetFarmStatus = setInterval(getFarmStatus, getTimeout(data.nextGroup));
    return;
  }

  clearInterval(timerGetFarmStatus);
  await parseStart();
};

const applyToolToPlant = async (model) => {
  const res = await api.applyTool(model);
  const {status} = await res.json();

  if (status === Status.CAPTCHA) {
    const res = await api.registerCaptcha();
    const {data} = await res.json();

    const res1 = await api.sendCaptcha({gt: data.gt, challenge: data.challenge});
    const data1 = await res1.json();

    setTimeout(async () => {
      const res = await api.getResolvedCaptcha(data1.request);
      const {request} = await res.json();

      await api.validateCaptcha({
        challenge: request['geetest_challenge'],
        validate: request['geetest_validate'],
        seccode: request['geetest_seccode'],
      });

      await api.applyTool(model);
    }, Duration.RESOLVED_CAPTCHA);
  }
};

const plantPlantInPot = async (sunflowerId) => {
  const res = await api.sowPlant(sunflowerId);
  const {data} = await res.json();

  const plantId = data._id;
  await sleep(() => applyToolToPlant({farmId: plantId, toolId: Tool.POT}));
  await sleep(() => applyToolToPlant({farmId: plantId, toolId: Tool.WATER}));
  await sleep(() => applyToolToPlant({farmId: plantId, toolId: Tool.WATER}));
};

const harvestPlant = async (plantId) => {
  await api.harvestPlant(plantId);
  await api.deletePlant(plantId);
};

const parsePlants = async () => {
  const res = await api.getFarms();
  const {data} = await res.json();

  const isMother = data.some(({plantType}) => plantType === PlantType.MOTHER);
  const plantsCount = data.length;

  if (plantsCount !== MAX_COUNT_PLANTS) {
    !isMother && await plantPlantInPot(PlantType.MOTHER);
    for (const item of Array.from(Array(MAX_COUNT_PLANTS - plantsCount), (val, idx) => idx)) {
      await plantPlantInPot(PlantType.CHILD);
    }
    return;
  }

  const plants = data.reduce((acc, cur) => {
    const {stage, activeTools} = cur;
    const currentCountWater = activeTools.filter(({type}) => type === 'WATER')[0]?.count || 0;

    if (currentCountWater < DEFAULT_COUNT_WATER) {
      acc.lackWater.push({...cur, countWater: currentCountWater});
      return acc;
    }

    if (stage === PlantStage.FARMING) {
      acc.farming.push(cur);
      return acc;
    }

    if (stage === PlantStage.PAUSED) {
      acc.paused.push(cur);
      return acc;
    }

    if (stage === PlantStage.CANCELLED) {
      acc.cancelled.push(cur);
      return acc;
    }

    return acc;
  }, {farming: [], paused: [], cancelled: [], lackWater: []});

  for (const item of plants.paused) {
    await sleep(() => applyToolToPlant({farmId: item._id, toolId: Tool.ANTI_CROW}));
  }

  for (const item of plants.cancelled) {
    await harvestPlant(item._id);
  }

  for (const item of plants.lackWater) {
    for (const value of Array.from(Array(DEFAULT_COUNT_WATER - item.countWater),
      (val, idx) => idx)) {
      await sleep(() => applyToolToPlant({farmId: item._id, toolId: Tool.WATER}));
    }
  }
};

const parseWorldTree = async () => {
  const res = await api.getWorldTreeData();
  const {data} = await res.json();

  if (!data.rewardAvailable) {
    await api.giveWaters();
  }

  const availableRewards = data.reward.filter(({status}) => status === RewardStatus.FINISH);

  for (const item of availableRewards) {
    await api.claimReward(item.type);
  }
};

const parseStart = async () => {
  clearInterval(timerParseWorldTree);
  clearInterval(timerParsePlants);

  await parseWorldTree();
  timerParseWorldTree = setInterval(parseWorldTree, Duration.PARSE_WORLD_TREE);

  await parsePlants();
  timerParsePlants = setInterval(parsePlants, Duration.PARSE_PLANTS);
};

const sendMessageNoToken = () => chrome.runtime.sendMessage({'message': 'failed_token'});
const sendMessageIsToken = (token) => {
  api.authToken = token;
  chrome.runtime.sendMessage({message: 'success_token'});
};

chrome.runtime.onMessage.addListener(({message, authToken}) => {
  if (message === 'set_auth_token' && !authToken) {
    sendMessageNoToken();
    return;
  }

  sendMessageIsToken(authToken);
  getFarmStatus().then();
});
