import React from 'react';
import PropTypes from 'prop-types';

const HelperTextBlock = ({ helperText, errorText, warnText }) => {
  if (errorText) {
    return <div className="ddorg__carbon-error-helper-text">{errorText}</div>;
  }

  if (warnText) {
    return <div className="ddorg__carbon-warning-helper-text">{warnText}</div>;
  }

  if (helperText) {
    return <div className="bx--form__helper-text">{helperText}</div>;
  }

  return null;
};

HelperTextBlock.propTypes = {
  helperText: PropTypes.node,
  errorText: PropTypes.node,
  warnText: PropTypes.node,
};

HelperTextBlock.defaultProps = {
  helperText: undefined,
  errorText: undefined,
  warnText: undefined,
};

export default HelperTextBlock;
