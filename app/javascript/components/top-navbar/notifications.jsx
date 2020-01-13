import React, { useEffect } from 'react';
import { Icon } from 'patternfly-react';
import { useDispatch, useSelector } from 'react-redux';
import { saveNotificationDrawerVisibility } from '../notification-drawer/helpers';

const Notifications = () => {
  const dispatch = useDispatch();
  const isDrawerVisible = useSelector(({ notificationReducer: { isDrawerVisible } }) => isDrawerVisible);
  const unreadCount = useSelector(({ notificationReducer: { unreadCount } }) => unreadCount);

  useEffect(() => {
    saveNotificationDrawerVisibility(isDrawerVisible);
  }, [isDrawerVisible]);

  return (
    <li className="dropdown">
      <a
        id="notifications-btn"
        className="nav-item-iconic drawer-pf-trigger-icon"
        title={`${unreadCount} ${__('unread notifications')}`}
        onClick={() => {
          dispatch({ type: '@@notifications/toggleDrawerVisibility', payload: isDrawerVisible });
        }}
      >
        <Icon type="fa" name="bell" />
        <span className="badge badge-pf-bordered">{unreadCount > 0 ? ' ' : ''}</span>
      </a>
    </li>
  );
};

export default (Notifications);
