let AUTH = '';
const TIME = 1 * 60 * 1000; // 默认延迟1min
let DELAY = [TIME, TIME + 3000]; // 最小间隔，最大间隔，随机发， 加3s浮动
let staticMsg = undefined;
const ignores = ['gm', 'gn', '肝'];
const msgIdList = [];
let flag = false;
let timer;

// 自动根据链接切 CHANNEL_ID
const CHANNEL_ID = location.pathname.slice(
  location.pathname.lastIndexOf('/') + 1,
  location.pathname.length);

const pushId2List = (id) => {
  if (msgIdList.length >= 10) {
    // 缓存10条会话id，超过丢弃最早的
    msgIdList.splice(0, 1);
  } else {
    msgIdList.push(id);
  }
}

const removeId2List = (id) => {
  msgIdList.splice(msgIdList.indexOf(id), 1);
}

const sendMsg = (msg) => {
  return fetch(`https://discord.com/api/v9/channels/${CHANNEL_ID}/messages`, {
    headers: {
      "Authorization": AUTH,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: msg,
      nonce: '94193' + Date.now(),
      tts: false
    }),
    method: 'POST',
  });
}

const replyMsg = (msg, replyInfo) => {
  return fetch(`https://discord.com/api/v9/channels/${CHANNEL_ID}/messages`, {
    headers: {
      "Authorization": AUTH,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: msg,
      nonce: '94193' + Date.now(),
      tts: false,
      message_reference: {
        channel_id: CHANNEL_ID,
        message_id: replyInfo?.roleMsgId
      }
    }),
    method: 'POST',
  });
}

const mockTypeing = () => {
  fetch(`https://discord.com/api/v9/channels/${CHANNEL_ID}/typing`, {
    headers: {
      "Authorization": AUTH,
      "Content-Type": "application/json",
    },
    method: 'POST',
  });
}

const getMessage = (topic) => {
  return fetch(`http://127.0.0.1:10086/api/getMessage`, {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: topic
    }),
    method: 'POST',
  });
}

const randomTime = (min, max) => {
  return Math.round(Math.random() * (max - min)) + min;
}


const getReply = (messages) => {
  const reply = Array.from(messages).reverse().find(node => {
    const id = msgIdList.reverse().find(id => {
      const dom = node.querySelector(`li div div div #message-content-${id}`);
      if (!!dom) {
        return dom
      }
    });
    if (!!id) {
      return node;
    }
  });

  if (reply) {
    removeId2List(reply?.id);
    const role = {
      id: reply?.id?.split('-')?.[2],
      message: reply.querySelector('.contents-2MsGLg div')?.innerHTML,
      role: reply.querySelector('.contents-2MsGLg h2 span span')?.innerHTML,
      roleMsgId: reply.querySelector('.contents-2MsGLg div')?.id?.split('-')?.[2],
    }
    console.log('有人@我', role);
    return role;
  } else {
    return null;
  }
}

let lastMsg;
let myLastMsg;
const exec = async () => {
  if (!flag) return;
  let time = randomTime((DELAY?.[0] || TIME), (DELAY?.[1] || TIME + 3000));
  if (staticMsg) {
    mockTypeing();
    sendMsg(staticMsg).then(res => {
      return res.json();
    });
  } else {
    const messages = document.querySelector('.scrollerInner-2PPAp2')?.childNodes;
    // 先检测有没有被@，有则先回复，无则继续往下
    const reply = getReply(messages);
    let currMsg;
    let currRole;
    if (reply) {
      currMsg = reply?.message;
      currRole = reply?.role;
    } else {
      currMsg = messages?.[messages?.length - 2]?.querySelector('.contents-2MsGLg div')?.innerHTML;
      currRole = messages?.[messages?.length - 2]?.querySelector('.contents-2MsGLg h2 span span')?.innerHTML;
    }

    var regex = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>]");
    if (currRole && currMsg &&
      lastMsg != currMsg && myLastMsg != currMsg &&
      !regex.test(currMsg) && !ignores.some(e => currMsg?.indexOf(e) > 0)) {
      lastMsg = currMsg;
      const result = await getMessage(currMsg).then(res => {
        return res.json();
      });
      console.log(`%c-----> ${currRole}: ${currMsg}`, 'font-size:30px;color:blue;');
      try {
        if (result?.data?.length > 20) {
          console.log('%c-----> 不回复超长了', 'font-size:30px;color:red;');
          time = 1000;
        } else {
          if (reply) {
            console.log(`%c-----> 我回复${reply?.role}: ${result?.data}`, 'font-size:30px;color:red;');
          } else {
            console.log(`%c-----> 我: ${result?.data}`, 'font-size:30px;color:red;');
          }
          mockTypeing();
          myLastMsg = result?.data;
          setTimeout(async () => {
            let data;
            if (reply) {
              data = await replyMsg(result?.data, reply).then(res => {
                return res.json();
              });
            } else {
              data = await sendMsg(result?.data).then(res => {
                return res.json();
              });
            }

            pushId2List(data?.id);
          }, 1000);
        }
      } catch (e) {
        console.log('%c-----> 本次不回复', 'font-size:30px;color:red;');
      }
    } else {
      console.log('%c-----> 不回复', 'font-size:30px;color:red;');
    }
  }
  timer = setTimeout(exec, time);
};

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request?.action === 'SET_STATE') {
      flag = !flag;
      if (!flag) {
        clearTimeout(timer);
      } else {
        console.log('%c-----> 3s 后进入ai🤖️聊天', 'font-size:50px;color:red;');
        AUTH = request?.token;
        let rwTime = Number(request?.time) || TIME;
        DELAY = [rwTime, rwTime + 3000];
        staticMsg = request?.msg || undefined;
        timer = setTimeout(() => {
          exec();
        }, 3000);
      }
      console.log(`%c----->切换🤖️状态: ${flag ? '开启' : '关闭'}`, `font-size:30px;color:${flag ? 'green' : 'red'};`);
    } else if (request?.action === 'SEARCH_ANSWER') {
      getQuestion();
    }
    sendResponse({ flag });
  }
);

const getAnswer = (question, options) => {
  return fetch(`http://127.0.0.1:10086/api/getAnswer`, {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      info: {
        question,
        options
      }
    }),
    method: 'POST',
  });
}

const getQuestion = async () => {
  const messages = document.querySelector('.scrollerInner-2PPAp2')?.childNodes;
  const question = messages?.[messages?.length - 2]?.querySelectorAll('.grid-1aWVsE div')?.[1]?.innerHTML;
  const answerDom = messages?.[messages?.length - 2]?.querySelector('.embedDescription-1DrJxZ')?.childNodes || [];
  const options = Array.from(answerDom).map(e => e?.data?.trim()).filter(e => !!e);
  const isQuestionMsg = !!messages?.[messages?.length - 2].querySelector('.embedFooterText-2Mc7H9');

  if (!options.length || !question || !isQuestionMsg) {
    console.log('%c----->抱歉没有答案', 'font-size:50px;color:red;');
    return;
  }

  const { data } = await getAnswer(question, options).then(res => {
    return res.json();
  });

  const sortData = (data || []).sort((a, b) => b?.rate - a?.rate);

  if (+sortData?.[0]?.rate) {
    console.log(`%c----->${question}`, 'font-size:25px;color:blue;');
    sortData?.forEach((e, i) => {
      if (i === 0) {
        console.log(`%c----->${sortData?.[0]?.option} ${sortData?.[0]?.rate}%`, 'font-size:25px;color:green;');
      } else {
        console.log(`%c----->${sortData?.[i]?.option} ${sortData?.[i]?.rate}%`, 'font-size:20px;color:red;');
      }
    });
  } else {
    console.log('%c----->抱歉没有答案', 'font-size:50px;color:red;');
  }
}