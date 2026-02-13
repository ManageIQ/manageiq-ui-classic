/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { ToastNotification, ActionableNotification, Link } from '@carbon/react';
import { useDispatch } from 'react-redux';
import { markNotificationRead, MARK_NOTIFICATION_READ } from '../../miq-redux/actions/notifications-actions';

const notificationTimerDelay = 8000;
const EMPTY = '';

/** Component to render the toast notification.
 *  The toastNotification is removed from the list after the time mentioned in notificationTimerDelay. */
const ToastItem = ({ toastNotification }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      // This filters out this toastNotification from the toastNotification's array. No API is called.
      dispatch({
        type: MARK_NOTIFICATION_READ,
        payload: toastNotification.id,
      });
    }, notificationTimerDelay);
    return () => clearTimeout(timer);
  }, []);

  // Use ActionableNotification when there's a link, otherwise use ToastNotification
  if (toastNotification.data.link) {
    return (
      <ActionableNotification
        key={toastNotification.id}
        kind={toastNotification.type}
        lowContrast
        inline={false}
        title={EMPTY}
        subtitle={toastNotification.message}
        onClick={() => dispatch(markNotificationRead(toastNotification))}
        role="status"
        className="miq-notification-toast-item-with-link"
      >
        <div className="pull-right toast-pf-action miq-notification-toast-details-link-wrap">
          <Link href={toastNotification.data.link}>{__('View details')}</Link>
        </div>
      </ActionableNotification>
    );
  }

  return (
    <ToastNotification
      key={toastNotification.id}
      kind={toastNotification.type}
      lowContrast
      title={EMPTY}
      caption={EMPTY}
      subtitle={toastNotification.message}
      onClick={() => dispatch(markNotificationRead(toastNotification))}
      className="miq-notification-toast-item"
      timeout={6000}
    />
  );
};

export default ToastItem;

ToastItem.propTypes = {
  toastNotification: PropTypes.objectOf(PropTypes.any).isRequired,
};
