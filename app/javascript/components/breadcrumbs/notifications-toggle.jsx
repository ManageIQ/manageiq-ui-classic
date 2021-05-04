import cx from 'classnames';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'carbon-components-react';
import { TOGGLE_DRAWER_VISIBILITY } from '../../miq-redux/actions/notifications-actions';
import MiqIcon from '../../menu/icon';
import NotificationDrawer from '../notification-drawer/notification-drawer';

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
    <div className="notification-module">
      <Button
        id="notifications-toggle"
        className={cx('btn', 'btn-default', {
          active: isDrawerVisible,
          unread: unreadCount,
        })}
        title={unreadCountText(unreadCount)}
        onClick={toggle}
        size="sm"
      >
        {__('Notifications')}
        {' '}
        <MiqIcon icon={unreadCount ? 'carbon--NotificationNew' : 'carbon--Notification'} />
      </Button>
      <NotificationDrawer />
    </div>
  );
};
