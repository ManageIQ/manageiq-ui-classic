import PropTypes from 'prop-types';

const WidgetFooter = ({
  lastRun = 'Never',
  nextRun = 'Never',
}) => (
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

export default WidgetFooter;
