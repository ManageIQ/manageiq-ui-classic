import React from 'react';
import PropTypes from 'prop-types';
import NotificationMessage from '../notification-message';

const MiqStructuredListMessage = ({ message, title }) => {
  const noticeMessage = message || sprintf(__('No entries found for %s'), title.toLowerCase());

  /** Function to render the message. */
  return (
    <div className="miq-structured-list-notification">
      <NotificationMessage type="info" message={noticeMessage} />
    </div>
  );
};

export default MiqStructuredListMessage;

MiqStructuredListMessage.propTypes = {
  message: PropTypes.string,
  title: PropTypes.string.isRequired,
};

MiqStructuredListMessage.defaultProps = {
  message: undefined,
};
