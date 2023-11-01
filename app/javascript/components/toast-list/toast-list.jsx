/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { useSelector } from 'react-redux';
import ToastItem from './toast-item';

const ToastList = () => {
  const toastNotifications = useSelector(({ notificationReducer: { toastNotifications } }) => toastNotifications);

  return (
    toastNotifications.length > 0 ? (
      <div id="toastnotification" className="toast-notification">
        {toastNotifications.slice(-3).map((toastNotification) => (
          <ToastItem toastNotification={toastNotification} key={toastNotification.id} />
        ))}
      </div>
    ) : null
  );
};

export default ToastList;
