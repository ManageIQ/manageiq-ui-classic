import React from 'react';
import PropTypes from 'prop-types';
import { InlineNotification } from 'carbon-components-react';

/**
 * Inline flash message for showing notifications.
 *
 * @param {Object} message - The notification details to display (kind, title, subtitle).
 *   If `null` or `undefined`, no notification is shown.
 * @param {Function} onCloseClick - Callback for handling close button clicks.
 * @param {boolean} showCloseButton - Whether to display the close button.
 */
const InlineFlashMessage = ({ message, onCloseClick, showCloseButton }) => {
  if (!message) return null;

  return (
    <InlineNotification
      kind={message.kind || 'info'} // "success" | "error" | "info" | "warning"
      title={message.title || ''}
      subtitle={message.subtitle || ''}
      lowContrast
      hideCloseButton={!showCloseButton}
      onCloseButtonClick={onCloseClick}
    />
  );
};

InlineFlashMessage.propTypes = {
  message: PropTypes.shape({
    kind: PropTypes.oneOf(['success', 'error', 'info', 'warning']).isRequired,
    title: PropTypes.string,
    subtitle: PropTypes.string,
  }).isRequired,
  onCloseClick: PropTypes.func,
  showCloseButton: PropTypes.bool,
};

InlineFlashMessage.defaultProps = {
  onCloseClick: () => {},
  showCloseButton: true,
};

export default InlineFlashMessage;
