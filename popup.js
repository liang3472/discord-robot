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

const timeInput = document.getElementById("timeInput");
const setTime = document.getElementById("setTime");

const wordsInput = document.getElementById("wordsInput");
const setWords = document.getElementById("setWords");

chrome.storage.sync.get(['token', 'time', 'msg'], function (result) {
  tokenInput.value = result?.token || '';
  timeInput.value = result?.time || null;
  wordsInput.value = result?.msg || null;
});

const updateState = (action) => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action,
      token: tokenInput?.value,
      time: timeInput?.value,
      msg: wordsInput?.value
    }, data => {
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

setTime.addEventListener("click", async () => {
  chrome.storage.sync.set({ time: timeInput.value }, function () {
    console.log('time is set: ' + timeInput.value);
  });
});

setWords.addEventListener("click", async () => {
  chrome.storage.sync.set({ msg: wordsInput.value }, function () {
    console.log('msg is set: ' + wordsInput.value);
  });
});