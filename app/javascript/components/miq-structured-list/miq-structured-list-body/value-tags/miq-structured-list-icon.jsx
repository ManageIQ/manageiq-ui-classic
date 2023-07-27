import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/** Component to render an icon in the cell.  */
const MiqStructuredListIcon = ({ row }) => (
  <div className={classNames('cell icon', row.background ? 'backgrounded-icon' : '')} title={row.title}>
    <i className={row.icon} title={row.title} style={{ background: row.background, color: row.color }} />
  </div>
);

export default MiqStructuredListIcon;

MiqStructuredListIcon.propTypes = {
  row: PropTypes.shape({
    icon: PropTypes.string.isRequired,
    title: PropTypes.string,
    color: PropTypes.string,
    background: PropTypes.string,
  }).isRequired,
};
