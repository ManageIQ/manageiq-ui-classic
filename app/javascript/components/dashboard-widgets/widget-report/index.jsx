import React from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';

const WidgetReport = ({ widgetModel }) => {
  let widget;
  if (widgetModel) {
    // eslint-disable-next-line react/no-danger
    widget = (<div className="widget-report" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(widgetModel) }} />);
  } else {
    widget = (
      <h1 className="empty-widget">
        {__('No report data found.')}
        {__(' If this widget is new or has just been added to your dashboard, the data is being generated and should be available soon.')}
      </h1>
    );
  }
  return widget;
};

WidgetReport.propTypes = {
  widgetModel: PropTypes.string,
};

WidgetReport.defaultProps = {
  widgetModel: undefined,
};

export default WidgetReport;
