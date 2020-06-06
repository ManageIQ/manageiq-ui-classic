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
