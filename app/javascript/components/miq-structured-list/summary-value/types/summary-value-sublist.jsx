import React from 'react';
import PropTypes from 'prop-types';
import { StructuredListCell } from 'carbon-components-react';
import classNames from 'classnames';
import SummaryValueItem from '../summary-value-item';

/** Component to render a list row value from Array which contains a sub-list. */
const SummaryValueSublist = ({ row, onClick }) => (
  row.sub_items.map((item, index) => (
    <StructuredListCell className={classNames('content_value', 'sub_item')} key={index.toString()}>
      <SummaryValueItem row={item} onClick={(event) => onClick(event)} />
    </StructuredListCell>
  ))
);

export default SummaryValueSublist;

SummaryValueSublist.propTypes = {
  row: PropTypes.shape({
    sub_items: PropTypes.arrayOf(PropTypes.any),
  }).isRequired,
  onClick: PropTypes.func,
};

SummaryValueSublist.defaultProps = {
  onClick: undefined,
};
