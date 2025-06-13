import i18n from '@/i18n';
import { insydeWS } from '@/env/insyde/store/plugins/InsydeWSPlugin';

/**
 ***************************************************************************
 * @file service.js
 *
 * @section LICENSE
 *
 * Copyright (c) 2013-2022, Insyde Software Corp. All Rights Reserved.
 *
 * You may not reproduce, distribute, publish, display, perform, modify, adapt,
 * transmit, broadcast, present, recite, release, license or otherwise exploit
 * any part of this publication in any form, by any means, without the prior
 * written permission of Insyde Software Corp.
 *
 *****************************************************************************/
const LANG_PREFIX = 'global.websocket.';
i18n.tm = function () {
  // Save missing handler
  let savemissing = i18n.missing;
  // Overwrite missing handler
  i18n.missing = function (locale, key) {
    // Remove LANG_PREFIX
    return key.replace(LANG_PREFIX, '');
  };
  // Prepend LANG_PREFIX
  arguments[0] = `${LANG_PREFIX}${arguments[0]}`;
  let msg = i18n.t(...arguments);
  // Restore missing handler
  i18n.missing = savemissing;
  return msg;
};

var uuid = '';
var WS_MSG_CATEGORY_MASK = 10000;
var WS_MSG_CATEGORY_NOTIFY_MASK = 3 * WS_MSG_CATEGORY_MASK;
var WS_MSG_CATEGORY_BIOS_LOCK = WS_MSG_CATEGORY_NOTIFY_MASK + 1;
var WS_MSG_CATEGORY_ONESHOT_MASK = 5 * WS_MSG_CATEGORY_MASK;
var WS_MSG_CATEGORY_ONESHOT_FW_UPDATE_ERROR = WS_MSG_CATEGORY_ONESHOT_MASK + 1;
var WS_MSG_CATEGORY_ONESHOT_FW_UPDATE_READY = WS_MSG_CATEGORY_ONESHOT_MASK + 2;
var WS_MSG_CATEGORY_ONESHOT_ACDLOG_READY = WS_MSG_CATEGORY_ONESHOT_MASK + 3;
var WS_MSG_CATEGORY_ONESHOT_BASDLOG_READY = WS_MSG_CATEGORY_ONESHOT_MASK + 4;
var WS_MSG_CATEGORY_ONESHOT_STATUS_CHANGED = WS_MSG_CATEGORY_ONESHOT_MASK + 5;
var WS_MSG_CATEGORY_ONESHOT_SILENT_MASK = 7 * WS_MSG_CATEGORY_MASK;
var WS_MSG_CATEGORY_ONESHOT_RAID_INIT_DONE =
  WS_MSG_CATEGORY_ONESHOT_SILENT_MASK + 1;
var WS_MSG_CATEGORY_ONESHOT_RAID_CACHE_DONE =
  WS_MSG_CATEGORY_ONESHOT_SILENT_MASK + 2;
var WS_MSG_CATEGORY_ONESHOT_RAID_INIT_START =
  WS_MSG_CATEGORY_ONESHOT_SILENT_MASK + 3;
var WS_MSG_CATEGORY_ONESHOT_RAID_INIT_FAIL =
  WS_MSG_CATEGORY_ONESHOT_SILENT_MASK + 4;

class wsHandler {
  // function constructor
  constructor(store) {
    this.store = store;
  }

  // method
  processMessage(data) {
    if (data['NOTIFY']) {
      this.processNotify(data);
    } else if (data['RESPONSE']) {
      this.processResponse(data);
    } else if (data['STATUS']) {
      this.store.commit('ws/status', data['MESSAGES']);
    } else {
      console.log('Unsupported websocket msg:');
      console.log(data);
    }
  }

  processNotify(data) {
    if (data['NOTIFY'] == 'MESSAGE_BOX_UPDATED') {
      if (!this.handleBiosLockMsg(data)) {
        if (data['METHOD'] == 'NEW') {
          this.store.commit('ws/addBox', data['MESSAGE']);
        } else if (data['METHOD'] == 'REMOVE') {
          this.store.commit('ws/delBox', data['MESSAGE']);
        }
        // insydeWS.send(JSON.stringify({ CMD: 'READ_MESSAGE_BOX' }));
      }
    } else if (data['NOTIFY'] == 'MESSAGE_ONE_SHOT') {
      if (data['CATEGORY'] && data['MESSAGE']) {
        let msg = data['MESSAGE'];
        if (data['CATEGORY'] == WS_MSG_CATEGORY_ONESHOT_FW_UPDATE_ERROR) {
          this.store.commit('ws/addNotifyMsgs', {
            type: 'error',
            text: `${i18n.tm('LANG_FW_UPDATE_ERR_PREFIX')}"${i18n.tm(msg)}".`,
          });
        } else if (data['CATEGORY'] == WS_MSG_CATEGORY_ONESHOT_ACDLOG_READY) {
          this.store.commit(
            'ws/addNotifyMsgs',
            i18n.tm('LANG_ACDLOG_NOTIFY_INFO')
          );
          this.store.commit('ws/acdReadyNotify');
        } else if (data['CATEGORY'] == WS_MSG_CATEGORY_ONESHOT_BASDLOG_READY) {
          this.store.commit(
            'ws/addNotifyMsgs',
            i18n.tm('LANG_SERVER_DIAGNOSTICS_BASD_ONDEMAND_TRIGGER_FINISH')
          );
          this.store.commit('ws/basdReadyNotify');
        } else if (data['CATEGORY'] == WS_MSG_CATEGORY_ONESHOT_STATUS_CHANGED) {
          if (data['MESSAGE'] == 'Image Ready') {
            // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_IKVM -->
            this.store.commit('ws/kvmImageReadyNotify');
            // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_IKVM -->
            return;
          } else {
            insydeWS.send(JSON.stringify({ CMD: 'READ_ALL_STATUS' }));
          }
        } else {
          this.store.commit('ws/addNotifyMsgs', msg);
        }
      }
    } else if (data['NOTIFY'] == 'MESSAGE_ONE_SHOT_SILENT') {
      if (data['CATEGORY'] && data['MESSAGE']) {
        let msg = data['MESSAGE'];
        if (data['CATEGORY'] == WS_MSG_CATEGORY_ONESHOT_RAID_INIT_DONE) {
          if (msg == 'RAID_INIT_DONE') {
            this.store.commit('ws/raidInitDoneNotify');
          }
        } else if (
          data['CATEGORY'] == WS_MSG_CATEGORY_ONESHOT_RAID_CACHE_DONE
        ) {
          if (msg == 'RAID_CACHE_DONE') {
            this.store.commit('ws/raidCacheDoneNotify');
          }
        } else if (
          data['CATEGORY'] == WS_MSG_CATEGORY_ONESHOT_RAID_INIT_START
        ) {
          this.store.commit('ws/raidInitStartNotify');
        } else if (data['CATEGORY'] == WS_MSG_CATEGORY_ONESHOT_RAID_INIT_FAIL) {
          this.store.commit('ws/raidInitFailNotify');
        }
      }
    }
  }

  handleBiosLockMsg(data) {
    if (
      data &&
      data['CATEGORY'] &&
      data['MESSAGE'] &&
      data['METHOD'] &&
      data['CATEGORY'] == WS_MSG_CATEGORY_BIOS_LOCK &&
      data['MESSAGE'] == 'BIOS_SETTING_LOCK'
    ) {
      if (data['METHOD'] == 'NEW') {
        this.store.commit('ws/biosLock', true);
      } else if (data['METHOD'] == 'REMOVE') {
        this.store.commit('ws/biosLock', false);
      }
      return true;
    }
    return false;
  }

  processResponse(data) {
    if (data['RESPONSE'] == 'READ_MESSAGE_BOX') {
      this.processMessageBox(data);
    }
  }

  processMessageBox(data) {
    if (!data || !data['UUID']) {
      return;
    }

    if (data['UUID'] == uuid) {
      console.log('Same uuid, ignore');
      return;
    }

    uuid = data['UUID'];

    if (!data['MESSAGES']) {
      return;
    }
    this.store.commit('ws/cleanBox');
    data['MESSAGES'].forEach((msg) => {
      if (!msg['CATEGORY']) {
        return;
      }
      var category = parseInt(
        parseInt(msg['CATEGORY'] / WS_MSG_CATEGORY_MASK) * WS_MSG_CATEGORY_MASK
      );
      if (category == 0 && parseInt(msg['CATEGORY']) == 5) {
        this.store.commit('ws/addBox', msg['MESSAGE']);
      } else if (category == WS_MSG_CATEGORY_NOTIFY_MASK && msg['MESSAGE']) {
        if (parseInt(msg['CATEGORY']) == WS_MSG_CATEGORY_BIOS_LOCK) {
          this.handleBiosLockMsg(msg);
        } else {
          this.store.commit('ws/addBox', msg['MESSAGE']);
        }
      } else if (category == WS_MSG_CATEGORY_ONESHOT_MASK && msg['MESSAGE']) {
        if (
          parseInt(msg['CATEGORY']) == WS_MSG_CATEGORY_ONESHOT_FW_UPDATE_READY
        ) {
          this.store.commit('ws/addBox', msg['MESSAGE']);
        }
      }
    });
  }
}

export default wsHandler;
