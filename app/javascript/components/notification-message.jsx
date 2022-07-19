import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export const NotificationTypes = {
  info: 'info',
  danger: 'danger',
  success: 'success',
  warning: 'warning',
};

const NotificationMessage = ({
  type, message,
}) => {
  const valid = Object.values(NotificationTypes).includes(type);

  if (valid && message) {
    return (
      <div className={classNames('alert', `alert-${type}`)}>
        <span className={classNames('pficon', `pficon-${type}`)} />
        <strong>{message}</strong>
      </div>
    );
  }
  return null;
};

export default NotificationMessage;

NotificationMessage.propTypes = {
  type: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};
