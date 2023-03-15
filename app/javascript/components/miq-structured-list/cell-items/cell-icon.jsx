import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/** Component to render an icon in MiqStructuredList row's value section. */
const CellIcon = ({ row }) => (
  <div className={classNames('cell icon', row.background ? 'backgrounded-icon' : '')} title={row.title}>
    <i className={row.icon} title={row.title} style={{ background: row.background, color: row.color }} />
  </div>
);

export default CellIcon;

CellIcon.propTypes = {
  row: PropTypes.shape({
    background: PropTypes.string,
    icon: PropTypes.string.isRequired,
    title: PropTypes.string,
    color: PropTypes.string,
  }),
};

CellIcon.defaultProps = {
  row: PropTypes.shape({
    background: undefined,
    title: undefined,
    color: undefined,
  }),
};
