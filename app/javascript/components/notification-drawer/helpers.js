export const saveNotificationDrawerVisibility = (isDrawerVisible) => {
  window.localStorage.setItem('miq-notification-drawer-shown', isDrawerVisible ? 'true' : 'false');
};

export const unreadCountText = function(count) {
  return sprintf(n__('%d unread notification', '%d unread notifications', count), count);
};

export const newCountText = function(count) {
  return sprintf(n__('%d New', '%d New', count), count);
};

export const getNotficationStatusIconName = notification => (
  {
    info: 'info',
    error: 'error-circle-o',
    danger: 'error-circle-o',
    warning: 'warning-triangle-o',
    success: 'ok',
    ok: 'ok',
  }[notification.type] || '');

export const viewDetails = function(notification) {
  window.location.href = `/restful_redirect?${$.param(notification.data.link)}`;
};
