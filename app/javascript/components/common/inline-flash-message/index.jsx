import React from 'react';
import PropTypes from 'prop-types';
import { InlineNotification } from 'carbon-components-react';

/**
 * Inline flash message for showing notifications.
 *
 * @param {Object} message - The notification details to display (kind, title, subtitle).
 *   If `null` or `undefined`, no notification is shown.
 * @param {Function} setMessage - Callback for handling close button clicks.
 * @param {boolean} showCloseButton - Whether to display the close button.
 */
const InlineFlashMessage = ({ message, setMessage, showCloseButton }) => {
  if (!message) return null;

  return (
    <InlineNotification
      kind={message.kind || 'info'} // "success" | "error" | "info" | "warning"
      title={message.title || ''}
      subtitle={message.subtitle || ''}
      lowContrast
      hideCloseButton={!showCloseButton}
      onCloseButtonClick={setMessage}
    />
  );
};

InlineFlashMessage.propTypes = {
  message: PropTypes.shape({
    kind: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
    title: PropTypes.string,
    subtitle: PropTypes.string,
  }),
  setMessage: PropTypes.func,
  showCloseButton: PropTypes.bool,
};

InlineFlashMessage.defaultProps = {
  message: null,
  setMessage: () => {},
  showCloseButton: true,
};

export default InlineFlashMessage;
