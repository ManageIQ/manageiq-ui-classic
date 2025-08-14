import moment from 'moment';
import { API } from '../http_api';

export const maxNotifications = 100;

export function convert(resource) {
  // API: resource.id, resource.details.text
  // ActionCable: resource.id, resource.text
  const details = resource.details || resource;

  const message = window.miqFormatNotification(details.text, details.bindings);
  const data = { link: details.bindings && details.bindings.link };
  const type = details.level === 'danger' ? 'error' : details.level;

  return {
    id: resource.id,
    notificationType: 'event',
    unread: !resource.seen,
    type,
    message,
    data,
    timeStamp: details.created_at || moment(new Date()).utc().format(),
  };
}

export function load(useLimit) {
  const limitFragment = useLimit ? `&limit=${maxNotifications}` : '';

  return API.get(`/api/notifications?expand=resources&attributes=details&sort_by=id&sort_order=desc${limitFragment}`)
    .then((data) => {
      const notifications = data.resources.map(convert);

      return {
        notifications,
        subcount: data.count
      };
    });
}

const bulkAction = (action) => (notifications) => API.post(`/api/notifications/`, {
  action,
  resources: notifications.map(notification => ({ id: notification.id })),
});

export const markRead = bulkAction('mark_as_seen');
export const clear = bulkAction('delete');
