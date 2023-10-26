/* eslint-disable no-eval */
import React from 'react';
import PropTypes from 'prop-types';
import { isObject, isArray, isSubItem } from '../helpers';
import MiqStructuredListArray from './value-types/miq-structured-list-array';
import MiqStructuredListObject from './value-types/miq-structured-list-object';
import MiqStructuredListSub from './value-types/miq-structured-list-sub';

/** Component to render the values of a cell.  */
const MiqStructuredListBodyValue = ({ row, onClick, clickEvents }) => (
  <>
    { isObject(row) && <MiqStructuredListObject row={row} onClick={onClick} clickEvents={clickEvents} /> }
    { isArray(row) && <MiqStructuredListArray row={row} onClick={onClick} clickEvents={clickEvents} /> }
    { isSubItem(row) && <MiqStructuredListSub row={row} onClick={onClick} clickEvents={clickEvents} /> }
  </>
);

export default MiqStructuredListBodyValue;

MiqStructuredListBodyValue.propTypes = {
  row: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.any), PropTypes.shape({})]).isRequired,
  clickEvents: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

MiqStructuredListBodyValue.defaultProps = {
  onClick: undefined,
};
