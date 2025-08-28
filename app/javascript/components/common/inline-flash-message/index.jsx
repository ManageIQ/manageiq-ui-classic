import React from 'react';
import PropTypes from 'prop-types';
import { InlineNotification } from 'carbon-components-react';

/**
 * @param {Object} message - The notification details to display (kind, title, subtitle).
 *   If `null`, no notification is shown.
 * @param {Function} setMessage - Optional state setter.
 *   If provided, the close button will be shown and will call `setMessage(null)`
 *   to dismiss the notification. If not provided, the close button is hidden.
 */
const InlineFlashMessage = ({ message, setMessage }) => {
  if (!message) return null;

  return (
    <InlineNotification
      kind={message.kind || 'info'} // "success" | "error" | "info" | "warning"
      title={message.title || ''}
      subtitle={message.subtitle || ''}
      lowContrast
      hideCloseButton={!setMessage}
      onCloseButtonClick={
        typeof setMessage === 'function' ? () => setMessage(null) : undefined
      }
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
};

InlineFlashMessage.defaultProps = {
  message: null,
  setMessage: undefined,
};

export default InlineFlashMessage;
