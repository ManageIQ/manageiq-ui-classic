import React from 'react';
import PropTypes from 'prop-types';
import MiqStructuredListInputs from './miq-structured-list-inputs';
import MiqStructuredListLink from './miq-structured-list-link';
import { hasInput } from '../../helpers';

/** Component render an item with or without a link or render an input tag. */
const MiqStructuredListConditionalTag = ({ row, onClick, clickEvents }) => (
  hasInput(row.value)
    ? <MiqStructuredListInputs value={row.value} action={(data) => onClick(data)} />
    : <MiqStructuredListLink row={row} onClick={onClick} clickEvents={clickEvents} />
);

export default MiqStructuredListConditionalTag;

MiqStructuredListConditionalTag.propTypes = {
  row: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.any), PropTypes.shape({})]).isRequired,
  clickEvents: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

MiqStructuredListConditionalTag.defaultProps = {
  onClick: undefined,
};
