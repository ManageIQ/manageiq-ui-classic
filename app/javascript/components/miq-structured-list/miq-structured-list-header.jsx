import React from 'react';
import PropTypes from 'prop-types';
import {
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
} from 'carbon-components-react';
import { isObject } from './helpers';

const MiqStructuredListHeader = ({ headers }) => {
  /** Function to render the header which contains sorting feature. */
  /** Usage eg: Compute / Container / Container Builds */
  const renderHeaderObjectItem = (header) => (
    <div className="sortable_header">
      <div className="pull-left">{header.value}</div>
      <div className="pull-right">
        <i className={header.sortable === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'} />
      </div>
    </div>
  );

  /** Function to render a header cell. */
  const renderHeaderItem = (header, index) => (
    <StructuredListCell head key={index} className="list_header">
      {isObject(header) ? renderHeaderObjectItem(header) : header}
    </StructuredListCell>
  );

  /** Function to render the headers. */
  return (
    <StructuredListHead>
      <StructuredListRow head tabIndex={0}>
        {
          headers.map((header, index) => renderHeaderItem(header, index))
        }
      </StructuredListRow>
    </StructuredListHead>
  );
};

export default MiqStructuredListHeader;

MiqStructuredListHeader.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.any),
};

MiqStructuredListHeader.defaultProps = {
  headers: [],
};
