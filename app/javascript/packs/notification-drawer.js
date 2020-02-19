import { get } from 'lodash';
import { listenToRx } from '../miq_observable';
import { API } from '../http_api';
import { addNotification, initNotifications } from '../miq-redux/actions/notifications-actions';

function notificationListener(data) {
  if (data.notification) {
    ManageIQ.redux.store.dispatch(addNotification(data));
  }
}

ManageIQ.redux.store.dispatch(initNotifications(true));
listenToRx(notificationListener);
