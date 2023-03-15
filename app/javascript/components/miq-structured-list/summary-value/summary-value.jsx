/* eslint-disable no-eval */
import React from 'react';
import PropTypes from 'prop-types';
import SummaryValueObject from './types/summary-value-object';
import SummaryValueArray from './types/summary-value-array';
import SummaryValueSublist from './types/summary-value-sublist';
import {
  isObject, isArray, isSubItem, rowProps,
} from '../helpers';
/** We receive row in 3 different types - Object, Array, SubItems(Also an array) */
const SummaryValue = ({ row, onClick }) => (
  <>
    { isObject(row) && <SummaryValueObject row={row} onClick={(event) => onClick(event)} /> }
    { isArray(row) && <SummaryValueArray row={row} onClick={(event) => onClick(event)} /> }
    { isSubItem(row) && <SummaryValueSublist row={row} onClick={(event) => onClick(event)} /> }
  </>
);
export default SummaryValue;

SummaryValue.propTypes = {
  row: PropTypes.oneOfType([
    rowProps,
    PropTypes.array,
  ]).isRequired,
  onClick: PropTypes.func,
};

SummaryValue.defaultProps = {
  onClick: undefined,
};
