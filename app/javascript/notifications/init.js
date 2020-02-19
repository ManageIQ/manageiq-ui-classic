import { addNotification, initNotifications } from './miq-redux/actions/notifications-actions';
import { listenToRx } from '../miq_observable.js';

export function init() {
  ManageIQ.redux.store.dispatch(initNotifications(true));

  listenToRx((data) => {
    if (data.notification) {
      ManageIQ.redux.store.dispatch(addNotification(data.notification));
    }
  });
}
