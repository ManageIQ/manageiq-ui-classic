import PropTypes from 'prop-types';

const WidgetError = ({ widgetId }) => (
  <div id={`dd_w${widgetId}_box`}>
    <div className="error-widget">
      <p>{__('Error: Request for data failed.')}</p>
    </div>
  </div>
);

WidgetError.propTypes = {
  widgetId: PropTypes.number.isRequired,
};

export default WidgetError;
