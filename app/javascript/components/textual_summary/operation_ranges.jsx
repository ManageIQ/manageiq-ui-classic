import * as React from 'react';
import PropTypes from 'prop-types';
import MiqStructuredList from '../miq-structured-list';

export default function OperationRanges(props) {
  const { title, items } = props;

  return (
    <MiqStructuredList
      rows={items}
      title={title}
      mode="operation_ranges"
    />
  );
}

OperationRanges.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};
