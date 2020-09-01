import React, { useState } from 'react';
import { Alert } from 'patternfly-react';
import PropTypes from "prop-types";

export const FlashMessage = (props) => {
  const [visible, setVisible] = useState(true);

  const onDismissClick = () => setVisible(false);

  return (
    (visible) &&
    <Alert className="alert alert-dismissable" type={props.flashMessage.level} onDismiss={() => onDismissClick()}>
      {props.flashMessage.message}
    </Alert>
  );
};

FlashMessage.propTypes = {
  flashMessage: PropTypes.shape({}),
};

FlashMessage.defaultProps = {
  flashMessage: undefined,
};

export default FlashMessage;
