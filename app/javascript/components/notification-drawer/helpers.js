export const saveNotificationDrawerVisibility = (isDrawerVisible) => {
  window.localStorage.setItem('miq-notification-drawer-shown', isDrawerVisible ? 'true' : 'false');
};

export const unreadCountText = function(count) {
  return sprintf(__('%d New'), count);
};
