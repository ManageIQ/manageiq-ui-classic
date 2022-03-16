import React from 'react';
import PropTypes from 'prop-types';

const WidgetFooter = ({ lastRun, nextRun }) => (
  <div className="card-pf-footer">
    {__('Updated On ')}
    {lastRun}
    {' | '}
    {__('Next Update On ')}
    {nextRun}
  </div>
);

WidgetFooter.propTypes = {
  lastRun: PropTypes.string,
  nextRun: PropTypes.string,
};

WidgetFooter.defaultProps = {
  lastRun: 'Never',
  nextRun: 'Never',
};

export default WidgetFooter;
