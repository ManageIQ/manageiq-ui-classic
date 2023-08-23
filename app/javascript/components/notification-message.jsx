import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { NotificationTypes } from '../helpers/notification-types';

/** Component to render a notification message. */
const NotificationMessage = ({ type, message }) => {
  const validType = type && Object.keys(NotificationTypes).includes(type);
  const notification = validType ? NotificationTypes[type] : NotificationTypes.unknown;
  if (message) {
    return (
      <div className={classNames('miq-notification-message-container', 'alert', notification.alert)}>
        <span className={classNames('pficon', notification.icon)} />
        <strong>{message}</strong>
      </div>
    );
  }
  return null;
};

export default NotificationMessage;

NotificationMessage.propTypes = {
  type: PropTypes.string,
  message: PropTypes.string,
};

NotificationMessage.defaultProps = {
  type: undefined,
  message: undefined,
};
