export const maxNotifications = 100;

export function convert(resource) {
  const message = window.miqFormatNotification(resource.details.text, resource.details.bindings);
  return {
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
  };
}
