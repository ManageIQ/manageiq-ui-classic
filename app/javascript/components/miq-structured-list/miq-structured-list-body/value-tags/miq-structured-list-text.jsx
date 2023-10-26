import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/** Component to print the text value inside a cell. */
const MiqStructuredListText = ({ value }) => {
  const text = (value === null || value === undefined ? '' : String(value));

  return (
    <div className={classNames(text ? 'expand' : '', 'wrap_text')}>
      {text}
    </div>
  );
};

export default MiqStructuredListText;

MiqStructuredListText.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.array, PropTypes.bool]),
};

MiqStructuredListText.defaultProps = {
  value: undefined,
};
