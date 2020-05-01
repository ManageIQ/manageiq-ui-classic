import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TOGGLE_DRAWER_VISIBILITY } from '../../miq-redux/actions/notifications-actions';

export const NotificationsToggle = () => {
  const dispatch = useDispatch();
  const { isDrawerVisible, unreadCount } = useSelector(({ notificationReducer }) => notificationReducer);

  useEffect(() => {
    window.localStorage.setItem('miq-notification-drawer-shown', isDrawerVisible ? 'true' : 'false');
  }, [isDrawerVisible]);

  const toggle = () => {
    dispatch({ type: TOGGLE_DRAWER_VISIBILITY });
  };

  const unreadCountText = function(count) {
    return sprintf(n__('%d unread notification', '%d unread notifications', count), count);
  };

  return (
    <a
      id="notifications-toggle"
      className={`btn btn-default ${isDrawerVisible && 'active'}`}
      title={unreadCountText(unreadCount)}
      onClick={toggle}
    >
      {__("Notifications")}
      &nbsp;
      <i className={`fa fa-bell ${unreadCount && 'unread'}`} />
    </a>
  );
};
