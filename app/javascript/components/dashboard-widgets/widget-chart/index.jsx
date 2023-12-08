import React from 'react';
import PropTypes from 'prop-types';
import DashboardWidget from '../dashboard-charts';

const WidgetChart = ({
  widgetModel, data, id, title,
}) => {
  let widget;
  if (widgetModel) {
    widget = DashboardWidget(data, id, title);
  } else {
    widget = (
      <h1 className="empty-widget">
        {__('No chart data found.')}
        {__(' If this widget is new or has just been added to your dashboard, the data is being generated and should be available soon.')}
      </h1>
    );
  }
  return widget;
};

WidgetChart.propTypes = {
  widgetModel: PropTypes.string,
};

WidgetChart.defaultProps = {
  widgetModel: undefined,
};

export default WidgetChart;
