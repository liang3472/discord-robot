const btnAiTalk = document.getElementById("btnAiTalk");
btnAiTalk.style.backgroundColor = 'red';
btnAiTalk.innerHTML = 'off';
btnAiTalk.color = '#ffffff';

const btnAnswer = document.getElementById("btnAnswer");
btnAnswer.style.backgroundColor = 'blue';
btnAnswer.color = '#ffffff';

const tokenInput = document.getElementById("tokenInput");
const setToken = document.getElementById("setToken");
btnAnswer.style.backgroundColor = 'green';

chrome.storage.sync.get(['token'], function (result) {
  tokenInput.value = result?.token || '';
});

const updateState = (action) => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action, token: tokenInput.value }, data => {
      if (btnAiTalk) {
        btnAiTalk.style.backgroundColor = data?.flag ? 'green' : 'red';
        btnAiTalk.innerHTML = data?.flag ? 'on' : 'off';
      }
    });
  });
}

const getState = () => {
  updateState('GET_STATE');
}

const setState = () => {
  updateState('SET_STATE');
}

updateState();
// When the button is clicked, inject setPageBackgroundColor into current page
btnAiTalk.addEventListener("click", async () => {
  setState();
});

btnAnswer.addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'SEARCH_ANSWER' });
  });
});

setToken.addEventListener("click", async () => {
  chrome.storage.sync.set({ token: tokenInput.value }, function () {
    console.log('token is set: ' + tokenInput.value);
  });
});