import * as ActionCable from '@rails/actioncable';

import { API } from '../http_api';
import { addNotification, initNotifications } from '../miq-redux/actions/notifications-actions';

let cable;

const disconnectCable = () => {
  if (cable) {
    // Clear the module reference first: each consumer's disconnected callback
    // treats "no longer the current cable" as an intentional disconnect.
    const consumer = cable;
    cable = undefined;
    consumer.disconnect();
  }
};

const init = () => {
  ManageIQ.redux.store.dispatch(initNotifications(true));

  if (!ManageIQ.asynchronous_notifications) {
    return;
  }

  // Disconnect any existing consumer before creating a new one so repeated
  // calls (e.g. pageshow after bfcache restore) don't leak WebSockets.
  disconnectCable();

  // Connect to the actioncable server
  const consumer = ActionCable.createConsumer('/ws/notifications');
  cable = consumer;

  consumer.subscriptions.create('NotificationChannel', {
    disconnected: () => {
      // Skip ws_init when this consumer was deliberately disconnected (pagehide / reconnect),
      // i.e. it is no longer the current cable. Tracking this per consumer means a stale
      // consumer's late onclose can't affect, or be affected by, a newer connection.
      // Only refresh the token when the server drops the connection unexpectedly.
      if (consumer !== cable) {
        return;
      }
      API.ws_init().then(null, () => {
        // Do not try to reconnect if the server disconnects
        console.warn('Unable to retrieve a valid ws_token!');
        if (consumer === cable && consumer.connection) {
          consumer.connection.close({ allowReconnect: false });
        }
      });
    },
    received: (data) => {
      // Pass the data further to the redux store
      ManageIQ.redux.store.dispatch(addNotification(data));
    },
  });
};

// Guard against registering duplicate listeners if this module is evaluated more than once.
if (!window._miqNotificationsListenersAttached) {
  window._miqNotificationsListenersAttached = true;

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
}

export default init;
