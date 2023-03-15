import React from 'react';
import PropTypes from 'prop-types';
import { StructuredListCell } from 'carbon-components-react';
import classNames from 'classnames';
import SummaryValueItem from '../summary-value-item';

/** Component to render a list row value from Object. */
const SummaryValueObject = ({ row, onClick }) => (
  <StructuredListCell className={classNames(row.label ? 'content_value' : 'label_header', 'object_item')}>
    <SummaryValueItem row={row} onClick={(event) => onClick(event)} />
  </StructuredListCell>
);

export default SummaryValueObject;

SummaryValueObject.propTypes = {
  row: PropTypes.shape({
    label: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
};

SummaryValueObject.defaultProps = {
  onClick: undefined,
};
