import './style.css';

const tokenStatus = document.querySelector('.page__tokenStatus');

chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, {message: 'get_auth_token'});
});

chrome.runtime.onMessage.addListener(({message}) => {
  if (message === 'success_token') {
    tokenStatus.textContent = 'Токен авторизации успешно найден';
  }

  if (message === 'failed_token') {
    tokenStatus.textContent = 'Токен авторизации не найден. Авторизуйтесь или перезагрузите страницу!';
  }
});
