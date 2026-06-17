import { setLocationHref } from "../../helpers/window-location";

export const newCountText = function(count) {
  // eslint-disable-next-line no-undef
  return sprintf(n__('%d New', '%d New', count), count);
};

export const getNotficationStatusIconName = (notification) => (
  {
    info: 'info',
    error: 'error',
    danger: 'error',
    warning: 'warning',
    success: 'success',
    ok: 'success',
  }[notification.type] || '');

export const viewDetails = function(notification) {
  setLocationHref(`/restful_redirect?${$.param(notification.data.link)}`)
};
