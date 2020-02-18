import { get } from 'lodash';
import { listenToRx } from '../miq_observable';
import { API } from '../http_api';
import { addNotification, initNotifications } from '../miq-redux/actions/notifications-actions';
import { maxNotifications, convert } from '../notifications/backend.js';

export function notificationsInit(useLimit) {
  const promises = [];
  const limitFragment = useLimit ? `&limit=${maxNotifications}` : '';

  promises.push(API.get(`/api/notifications?expand=resources&attributes=details&sort_by=id&sort_order=desc${limitFragment}`)
    .then((data) => {
      const notifications = data.resources.map(convert);

      return {
        notifications,
        subcount: data.subcount,
      };
    }));

  if (useLimit) {
    // get real subcount
    promises.push(API.get('/api/notifications'));
  }

  return Promise.all(promises).then(([{ notifications, subcount }, meta]) => ({
    notifications,
    subcount: meta ? meta.subcount : subcount,
  }));
}

function notificationListener(data) {
  if (data.notification) {
    ManageIQ.redux.store.dispatch(addNotification(data));
  }
}

ManageIQ.redux.store.dispatch(initNotifications(true));
listenToRx(notificationListener);
