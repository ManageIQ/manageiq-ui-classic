import * as ActionCable from '@rails/actioncable';

import { API } from '../http_api';
import { addNotification, initNotifications } from '../miq-redux/actions/notifications-actions';

let cable;

const init = () => {
  ManageIQ.redux.store.dispatch(initNotifications(true));

  if (!ManageIQ.asynchronous_notifications) {
    return;
  }

  // Connect to the actioncable server
  cable = ActionCable.createConsumer('/ws/notifications');

  cable.subscriptions.create('NotificationChannel', {
    disconnected: () => {
      API.ws_init().then(null, () => {
        // Do not try to reconnect if the server disconnects
        cable.connection.close({ allowReconnect: false });
      });
    },
    received: (data) => {
      // Pass the data further to the redux store
      ManageIQ.redux.store.dispatch(addNotification(data));
    },
  });
};

// Disconnect the ActionCable consumer when the page is hidden so the browser
// is allowed to put it into the Back-Forward Cache (bfcache).  An open
// WebSocket blocks bfcache, causing the back button to trigger a full reload.
window.addEventListener('pagehide', () => {
  if (cable) {
    cable.disconnect();
    cable = undefined;
  }
});

// When the page is restored from bfcache, force the spinner off (it may have
// been left on by an in-flight XHR that was suspended when the page was cached)
// and then re-open the ActionCable connection.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    if (window.miqSparkleOff) {
      window.miqSparkleOff();
    }
    init();
  }
});

export default init;
