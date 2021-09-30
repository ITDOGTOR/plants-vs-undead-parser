chrome.runtime.onMessage.addListener(({message}) => {
  if (message === 'get_auth_token') {
    chrome.runtime.sendMessage({'message': 'set_auth_token', 'authToken': localStorage.getItem('token')});
  }
});
