import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { valueProps } from '../helpers';

/** Component to render a text in MiqStructuredList row's value section. */
const CellText = ({ value }) => {
  const text = (value === null || value === undefined ? '' : String(value));
  return (
    <div className={classNames(text ? 'expand' : '', 'wrap_text')}>
      {text}
    </div>
  );
};

export default CellText;

CellText.propTypes = {
  value: valueProps,
};

CellText.defaultProps = {
  value: PropTypes.undefined,
};
