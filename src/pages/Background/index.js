import {getTimeout} from './modules/utils';
import {getFarmStatus, parsePlants, parseWorldTree, sendMessageIsToken, sendMessageNoToken} from './modules/actions';
import {Duration} from './modules/constants';

let timerGetFarmStatus = 0;
let timerParseWorldTree = 0;
let timerParsePlants = 0;

chrome.runtime.onMessage.addListener(({message, authToken}) => {
  if (message === 'set_auth_token' && !authToken) {
    sendMessageNoToken();
    return;
  }

  sendMessageIsToken(authToken);
  preStart().then();
});

const preStart = async () => {
  const {nextGroup} = await getFarmStatus();
  if (nextGroup) {
    timerGetFarmStatus = setInterval(preStart, getTimeout(nextGroup));
    return;
  }

  clearInterval(timerGetFarmStatus);
  await parseStart();
};

const parseStart = async () => {
  clearInterval(timerParseWorldTree);
  clearInterval(timerParsePlants);

  await parseWorldTree();
  timerParseWorldTree = setInterval(parseWorldTree, Duration.PARSE_WORLD_TREE);

  await parsePlants();
  timerParsePlants = setInterval(parsePlants, Duration.PARSE_PLANTS);
};
