import React from 'react';
import PropTypes from 'prop-types';
import MiqStructuredListIcon from '../value-tags/miq-structured-list-icon';
import MiqStructuredListText from '../value-tags/miq-structured-list-text';

/** Usage eg: Services / Workloads / VMs & Instances / Normal Operating Ranges */
const MiqStructuredListMultiRow = ({ value }) => (
  <div className="multi_row_cell">
    {value.map((item, index) => (
      <div
        className="sub_row_item"
        key={index.toString()}
        title={item.title ? item.title : ''}
      >
        { item.icon && <MiqStructuredListIcon row={item} /> }
        { item.label && <div className="sub_label" title={item.label}>{item.label}</div> }

        <div className="sub_value">
          <MiqStructuredListText value={item.value} />
        </div>
      </div>
    ))}
  </div>
);

export default MiqStructuredListMultiRow;

MiqStructuredListMultiRow.propTypes = {
  value: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.any), PropTypes.shape({})]).isRequired,
};
