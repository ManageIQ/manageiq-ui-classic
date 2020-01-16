import { listenToRx } from '../miq_observable';
import { viewDetails } from '../components/notification-drawer/helpers';

export const maxNotifications = 100;

function addNotification(data) {
  if (data.notification) {
    const msg = window.miqFormatNotification(data.notification.text, data.notification.bindings);
    const notificationData = { link: _.get(data.notification, 'bindings.link') };
    const { id } = data.notification;
    const newNotification = {
      id,
      notificationType: 'event',
      unread: true,
      type: data.notification.level === 'danger' ? 'error' : data.notification.level,
      message: msg,
      data: notificationData,
      actionTitle: notificationData.link ? __('View details') : undefined,
      actionCallback: notificationData.link ? viewDetails : undefined,
      href: id ? `${window.location.origin}/api/notifications/${id}` : undefined,
      timeStamp: moment(new Date()).utc().format(),
    };
    ManageIQ.redux.store.dispatch({ type: '@@notifications/addNotification', payload: newNotification });
  }
}

export function notificationsInit(useLimit) {
  const notifications = [];
  const promises = [];
  const limitFragment = useLimit ? `&limit=${maxNotifications.toString()}` : '';
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
            link: _.get(resource.details, 'bindings.link'),
          },
          href: resource.href,
          timeStamp: resource.details.created_at,
        });
      });
      return notifications;
    }));
  if (useLimit) {
    promises.push(API.get('/api/notifications'));
  }
  return Promise.all(promises).then(([notifications, meta]) => {
    ManageIQ.redux.store.dispatch({ type: '@@notifications/initNotifications', payload: { notifications, count: meta ? meta.subcount : 100 } });
  });
}

listenToRx(addNotification);
