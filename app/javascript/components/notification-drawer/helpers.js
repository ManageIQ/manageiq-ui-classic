export const saveNotificationDrawerVisibility = (isDrawerVisible) => {
  window.localStorage.setItem('miq-notification-drawer-shown', isDrawerVisible ? 'true' : 'false');
};

export const unreadCountText = function(count) {
  return sprintf(__('%d New'), count);
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
