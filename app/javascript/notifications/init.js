import ActionCable from 'actioncable';

import { API } from '../http_api';
import { addNotification, initNotifications } from '../miq-redux/actions/notifications-actions';

export function init() {
  ManageIQ.redux.store.dispatch(initNotifications(true));

  const cable = ActionCable.createConsumer('/ws/notifications');

  cable.subscriptions.create('NotificationChannel', {
    disconnected: () => {
      API.ws_init().then(null, () => {
        console.warn('Unable to retrieve a valid ws_token!');
        cable.connection.close({ allowReconnect: false });
      });
    },
    received: (data) => {
      ManageIQ.redux.store.dispatch(addNotification(data));
    },
  });
}
