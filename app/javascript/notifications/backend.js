export const maxNotifications = 100;

export function convert(resource) {
  // API: resource.id, resource.details.text
  // ActionCable: resource.id, resource.text
  let details = resource.details || resource;

  const message = window.miqFormatNotification(details.text, details.bindings);
  const data = { link: details.bindings && details.bindings.link };

  return {
    id: resource.id,
    notificationType: 'event',
    unread: !resource.seen,
    type: details.level,
    message,
    data,
    href: resource.href,
    timeStamp: details.created_at,
  };
}
