import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ToastNotificationList, TimedToastNotification,
} from 'patternfly-react';
import { markNotificationRead, removeToastNotification } from '../../miq-redux/actions/notifications-actions';
import { viewDetails } from '../notification-drawer/helpers';

const notificationTimerDelay = 8000;

const ToastList = () => {
  const dispatch = useDispatch();
  const toastNotifications = useSelector(({ notificationReducer: { toastNotifications } }) => toastNotifications);

  return (
    toastNotifications.length > 0 ? (
      <ToastNotificationList>
        {toastNotifications.map(toastNotification => (
          <TimedToastNotification
            key={toastNotification.id}
            type={toastNotification.type}
            persistent={toastNotification.type === 'error'}
            onDismiss={(event) => {
              if (event) {
                return dispatch(markNotificationRead(toastNotification.id));
              }
              return dispatch(removeToastNotification(toastNotification.id));
            }}
            timerdelay={notificationTimerDelay}
          >
            {toastNotification.data.link && (
              <div className="pull-right toast-pf-action">
                <a href="#" onClick={() => viewDetails(toastNotification)}>{__('View details')}</a>
              </div>
            )}
            <span>{toastNotification.message}</span>
          </TimedToastNotification>))}
      </ToastNotificationList>
    ) : null
  );
};

export default ToastList;
