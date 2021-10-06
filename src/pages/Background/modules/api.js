export default class ApiService {
  _authToken = '';
  _mainUrl = 'https://backend-farm.plantvsundead.com';
  _antiCaptchaUrl = 'http://rucaptcha.com';
  _antiCaptchaKey = '488747193466abefc5776074397b9dd7';

  setAuthToken = (value) => {
    this._authToken = value;
  };

  _getResource = async (path) => {
    const response = await fetch(`${this._mainUrl}${path}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this._authToken}`,
      },
    });

    if (!response.ok) {

    }

    return await response.json();
  };

  _postResource = async (path, data = {}) => {
    const response = await fetch(`${this._mainUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this._authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {

    }

    return await response.json();
  };

  getFarmStatus = async () => {
    return await this._getResource('/farm-status');
  };

  getFarms = async () => {
    return await this._getResource('/farms');
  };

  getFarmingStats = async () => {
    return await this._getResource('/farming-stats');
  };

  getMySunflowers = async () => {
    return await this._getResource('/my-sunflowers');
  };

  buySunflower = async (plantType) => {
    const bodyData = {
      amount: 1,
      sunflowerId: plantType,
    };

    return await this._postResource('/buy-sunflowers', bodyData);
  };

  getMyTools = async () => {
    return await this._getResource('/my-tools');
  };

  buyTool = async (toolId) => {
    const bodyData = {
      amount: 1,
      toolId,
    };

    return await this._postResource('/buy-tools', bodyData);
  };

  plantInGround = async (plantType) => {
    const bodyData = {
      landId: 0,
      sunflowerId: plantType,
    };

    return await this._postResource('/farms', bodyData);
  };

  plantCare = async (data) => {
    const bodyData = {
      ...data,
      token: {
        challenge: 'default',
        seccode: 'default',
        validate: 'default',
      },
    };

    return await this._postResource('/farms/apply-tool', bodyData);
  };

  /*  harvestAllPlant = async () => {
      return await this._postResource('/harvest-all');
    };*/

  harvestPlant = async (plantId) => {
    return await this._postResource(`/farms/${plantId}/harvest`);
  };

  deletePlant = async (plantId) => {
    return await this._postResource(`/farms/${plantId}/deactivate`);
  };

  getWorldTree = async () => {
    return await this._getResource('/world-tree/datas');
  };

  waterWorldTree = async () => {
    const bodyData = {
      amount: 20,
    };

    return await this._postResource('/world-tree/give-waters', bodyData);
  };

  claimReward = async (rewardId) => {
    const bodyData = {
      type: rewardId,
    };

    return await this._postResource('/world-tree/claim-reward', bodyData);
  };

  claimYesterdayRewards = async () => {
    return await this._postResource('/claim-yesterday-reward');
  };

  registerCaptcha = async () => {
    return await this._getResource('/captcha/register');
  };

  validateCaptcha = async (validCaptcha) => {
    const bodyData = {
      challenge: validCaptcha['geetest_challenge'],
      seccode: validCaptcha['geetest_validate'],
      validate: validCaptcha['geetest_seccode'],
    };

    return await this._postResource('/captcha/validate', bodyData);
  };

  sendCaptcha = async (captchaData) => {
    const bodyData = {
      ...captchaData,
      key: this._antiCaptchaKey,
      method: 'geetest',
      pageurl: 'https://marketplace.plantvsundead.com/#/farm/',
      json: 1,
    };

    const response = await fetch(`${this._antiCaptchaUrl}/in.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {

    }

    return await response.json();
  };

  getResolvedCaptcha = async (captchaId) => {
    const queryParameters = `?key=${this._antiCaptchaKey}&action=get&json=1&id=${captchaId}`;
    const response = await fetch(`${this._antiCaptchaUrl}/res.php${queryParameters}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {

    }

    return await response.json();
  };
}

