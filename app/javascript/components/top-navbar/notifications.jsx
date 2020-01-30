import React, { useEffect } from 'react';
import { Icon } from 'patternfly-react';
import { useDispatch, useSelector } from 'react-redux';
import { saveNotificationDrawerVisibility } from '../notification-drawer/helpers';
import { TOGGLE_DRAWER_VISIBILITY } from '../../miq-redux/actions/notifications-actions';

const Notifications = () => {
  const dispatch = useDispatch();
  const { isDrawerVisible, unreadCount } = useSelector(({ notificationReducer }) => notificationReducer);

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
          dispatch({ type: TOGGLE_DRAWER_VISIBILITY });
        }}
      >
        <Icon type="fa" name="bell" />
        <span className="badge badge-pf-bordered">{unreadCount > 0 ? ' ' : ''}</span>
      </a>
    </li>
  );
};

export default Notifications;
