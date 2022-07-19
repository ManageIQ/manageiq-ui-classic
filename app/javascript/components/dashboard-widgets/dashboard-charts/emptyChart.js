import React from 'react';

const EmptyChart = () =>
  (
    <div className="empty-chart-content">
      <span className="pficon pficon-info" />
      <span>{__('No data available')}</span>
    </div>
  );
export default EmptyChart;
