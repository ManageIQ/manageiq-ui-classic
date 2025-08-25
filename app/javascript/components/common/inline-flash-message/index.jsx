import React from 'react';
import PropTypes from 'prop-types';
import { InlineNotification } from 'carbon-components-react';

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
