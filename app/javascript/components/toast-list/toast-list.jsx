import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ToastNotificationList, TimedToastNotification,
} from 'patternfly-react';
import { API } from '../../http_api';

const ToastList = () => {
  const dispatch = useDispatch();
  const toastNotifications = useSelector(({ notificationReducer: { toastNotifications } }) => toastNotifications);
  const notificationTimerDelay = 8000;

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
                return API.post(`/api/notifications/${toastNotification.id}`, { action: 'mark_as_seen' })
                  .then(() =>
                    dispatch({
                      type: '@@notifications/markNotificationRead',
                      payload: toastNotification.id,
                    }));
              }
              return dispatch({
                type: '@@notifications/removeToastNotification',
                payload: toastNotification.id,
              });
            }}
            timerdelay={notificationTimerDelay}
          >
            <span>{toastNotification.message}</span>
          </TimedToastNotification>))}
      </ToastNotificationList>
    ) : null
  );
};

export default ToastList;
