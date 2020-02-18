import { get } from 'lodash';
import { listenToRx } from '../miq_observable';
import { API } from '../http_api';
import { addNotification, initNotifications } from '../miq-redux/actions/notifications-actions';

export const maxNotifications = 100;

export function notificationsInit(useLimit) {
  const notifications = [];
  const promises = [];
  const limitFragment = useLimit ? `&limit=${maxNotifications}` : '';
  promises.push(API.get(`/api/notifications?expand=resources&attributes=details&sort_by=id&sort_order=desc${limitFragment}`)
    .then((data) => {
      data.resources.forEach((resource) => {
        const message = window.miqFormatNotification(resource.details.text, resource.details.bindings);
        notifications.push({
          id: resource.id,
          notificationType: 'event',
          unread: !resource.seen,
          type: resource.details.level,
          message,
          data: {
            link: get(resource.details, 'bindings.link'),
          },
          href: resource.href,
          timeStamp: resource.details.created_at,
        });
      });
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
