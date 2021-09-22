/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToastNotification, Link } from 'carbon-components-react';
import { markNotificationRead } from '../../miq-redux/actions/notifications-actions';

const notificationTimerDelay = 8000;
const EMPTY = '';

const ToastList = () => {
  const dispatch = useDispatch();
  const toastNotifications = useSelector(({ notificationReducer: { toastNotifications } }) => toastNotifications);

  return (
    toastNotifications.length > 0 ? (
      <div id="toastnotification" className="toast-notification">
        {toastNotifications.map((toastNotification) => (
          <ToastNotification
            key={toastNotification.id}
            kind={toastNotification.type}
            lowContrast
            title={EMPTY}
            caption={EMPTY}
            subtitle={toastNotification.message}
            onClick={() => {
                return dispatch(markNotificationRead(toastNotification));
            }}
            timeout={notificationTimerDelay}
          >
            {toastNotification.data.link && (
              <div className="pull-right toast-pf-action">
                <Link href={toastNotification.data.link}>{__('View details')}</Link>
              </div>
            )}
            <span>{toastNotification.messages}</span>
          </ToastNotification>
        ))}
      </div>
    ) : null
  );
};

export default ToastList;
