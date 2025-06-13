import i18n from '@/i18n';
import wsHandler from './WSHandler';

export let insydeWS = undefined;
let wsReconnectCnt = 0;
let wsReconnectMax = 10;
let pingCheckTimer = undefined;
let pingMissingCnt = 0;
let kick = false;
function onKick() {
  kick = true;
}

let heartbeatTimeout = 60; // Default 60s update when receving ping
let pingInterval = 10; // 10s
let PingMissingUpperBound = Math.ceil(heartbeatTimeout / pingInterval);
const setCheckPingTimer = () => {
  // Setup kick event, remove it first to prevent duplicate listeners.
  window.removeEventListener('click', onKick);
  window.removeEventListener('mousemove', onKick);
  window.removeEventListener('keypress', onKick);
  window.addEventListener('click', onKick);
  window.addEventListener('mousemove', onKick);
  window.addEventListener('keypress', onKick);

  // reset when received messages.
  if (pingCheckTimer) {
    clearInterval(pingCheckTimer);
    pingCheckTimer = undefined;
  }
  pingCheckTimer = setInterval(function () {
    // console.log('Debug ping', pingMissingCnt, PingMissingUpperBound);
    if (++pingMissingCnt > PingMissingUpperBound) {
      console.error(
        'receive messages failed through websocket for',
        heartbeatTimeout + 's'
      );
      insydeWS.close();
      clearInterval(pingCheckTimer);
      pingCheckTimer = undefined;
    }
  }, pingInterval * 1000);
};

const HeartBeatPlugin = (store) => {
  let handler = new wsHandler(store);
  const processMessage = (data) => {
    if (typeof data != 'object') return;

    if (data?.error) {
      // error handle
      console.error(`insydeWS received error: ${data.error}`);
      clearInterval(pingCheckTimer);
      pingCheckTimer = undefined;
      if (data?.error == 1003) {
        console.error(i18n.t('global.websocket.error.1003'));
      } else if (data?.error == 17) {
        alert(i18n.t('global.websocket.error.17'));
      }
      insydeWS.close();
    } else if (data?.PING === 'UPDATE_SID') {
      // ping process
      insydeWS.send(
        JSON.stringify({
          CMD: 'PONG',
          KICK: kick,
        })
      );
      kick = false;
      pingMissingCnt = 0;
      if (Object.prototype.hasOwnProperty.call(data, 'heartbeat')) {
        if (data.heartbeat != heartbeatTimeout) {
          if (data.heartbeat == 0) {
            // Disable heartbeat checker
            console.log('Disable heartbeat checker');
            clearInterval(pingCheckTimer);
            pingCheckTimer = undefined;
          } else if (heartbeatTimeout == 0) {
            // Enable heartbeat checker
            setCheckPingTimer();
          }
          // Update heartbeat
          heartbeatTimeout = data.heartbeat;
          PingMissingUpperBound = Math.ceil(data.heartbeat / pingInterval);
        }
      }
    } else {
      handler.processMessage(data);
    }
  };

  const initInsydeWS = () => {
    insydeWS = new WebSocket(`wss://${window.location.host}/mi_ws_msg_service`);
    insydeWS.handler = handler;

    // When closed, we need to reconnect, which is determined by manual close or not.
    // Add manualCloseFlag and override close to do it.
    insydeWS.manualCloseFlag = false;
    insydeWS._close = insydeWS.close; // Save original close
    // Override close
    insydeWS.close = function () {
      insydeWS._close();
      insydeWS.manualCloseFlag = true;
    };

    insydeWS.onopen = () => {
      insydeWS.send(
        JSON.stringify({
          CMD: 'INIT_SID',
          PARAMS: {
            SID: 'PlaceholderForWebSessionId      ',
          },
        })
      );
      insydeWS.send(JSON.stringify({ CMD: 'READ_MESSAGE_BOX' }));
      insydeWS.send(JSON.stringify({ CMD: 'READ_ALL_STATUS' }));
      if (store.getters['ws/kvmImageGenerate'] > 0) {
        insydeWS.send(JSON.stringify({ CMD: 'GENERATE_SCREEN_PREVIEW' }));
      }
    };
    insydeWS.onerror = () => {
      console.warn('insydeWS onerror');
    };
    insydeWS.onmessage = (event) => {
      wsReconnectCnt = 0; // Reset Reconnect Count.
      if (!(event.data instanceof Blob)) {
        return;
      }

      const reader = new FileReader();
      reader.onload = function () {
        try {
          let jsons = reader.result.split('__ws_token_end__');
          jsons.forEach(function (e) {
            if (e != '') {
              processMessage(JSON.parse(e));
            }
          });
        } catch (err) {
          console.log('insydeWS parse json fail ' + err);
        }
      };
      reader.readAsText(event.data);
    };
    insydeWS.onclose = () => {
      if (!insydeWS.manualCloseFlag && wsReconnectCnt++ < wsReconnectMax) {
        // Reconnect
        console.warn(
          'insydeWS onclose, reconnect',
          wsReconnectCnt,
          wsReconnectMax
        );
        setTimeout(initInsydeWS, 3000);
      } else {
        if (!store.getters['heartbeat/isIgnoreLogout']) {
          store.dispatch('authentication/logout');
        }
      }
    };
    setCheckPingTimer();
  };

  store.subscribe(({ type }) => {
    if (type === 'authentication/authSuccess') {
      initInsydeWS();
    }

    if (type === 'authentication/logout') {
      if (insydeWS) insydeWS.close();
    }
  });

  if (store.getters['authentication/isLoggedIn']) initInsydeWS();
};

export default HeartBeatPlugin;
