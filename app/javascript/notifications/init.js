import * as ActionCable from '@rails/actioncable';

import { API } from '../http_api';
import { addNotification, initNotifications } from '../miq-redux/actions/notifications-actions';

let cable;
let intentionalDisconnect = false;

const disconnectCable = () => {
  if (cable) {
    intentionalDisconnect = true;
    cable.disconnect();
    cable = undefined;
  }
};

const init = () => {
  ManageIQ.redux.store.dispatch(initNotifications(true));

  if (!ManageIQ.asynchronous_notifications) {
    return;
  }

  // Disconnect any existing consumer before creating a new one so repeated
  // calls (e.g. pageshow after bfcache restore) don't leak WebSockets.
  // intentionalDisconnect is left true here; the disconnected callback will
  // clear it once the WebSocket onclose fires asynchronously.
  disconnectCable();

  // Connect to the actioncable server
  cable = ActionCable.createConsumer('/ws/notifications');

  cable.subscriptions.create('NotificationChannel', {
    disconnected: () => {
      // Skip ws_init when we deliberately disconnected (pagehide / reconnect).
      // Only refresh the token when the server drops the connection unexpectedly.
      if (intentionalDisconnect) {
        intentionalDisconnect = false;
        return;
      }
      API.ws_init().then(null, () => {
        // Do not try to reconnect if the server disconnects
        console.warn('Unable to retrieve a valid ws_token!');
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
  disconnectCable();
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
