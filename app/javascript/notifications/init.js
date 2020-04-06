import ActionCable from 'actioncable';

import { API } from '../http_api';
import { addNotification, initNotifications } from '../miq-redux/actions/notifications-actions';

const init = () => {
  ManageIQ.redux.store.dispatch(initNotifications(true));

  if (ManageIQ.asynchronous_notifications) {
    // Connect to the actioncable server
    const cable = ActionCable.createConsumer('/ws/notifications');

    cable.subscriptions.create('NotificationChannel', {
      disconnected: () => {
        API.ws_init().then(null, () => {
          console.warn('Unable to retrieve a valid ws_token!');
          // Do not try to reconnect if the server disconnects
          cable.connection.close({ allowReconnect: false });
        });
      },
      received: (data) => {
        // Pass the data further to the redux store
        ManageIQ.redux.store.dispatch(addNotification(data));
      },
    });
  }
};

export default init;
