import React from 'react';
import PropTypes from 'prop-types';
import PodsAreaChart from '../provider-dashboard-charts/pod-trend-charts/podsAreaChart';

const TrendChartCard = ({ title, chartData, config }) => (
  <div className="card-pf card-pf-aggregate-status card-pf-accented chart-card">
    <h2 className="card-title">
      {title}
    </h2>
    <div className="card-pf-body">
      <div id="pods-area-chart">
        <PodsAreaChart data={chartData} config={config} dataPoint="pod_metrics" toolbarEnabled={false} />
      </div>
    </div>
  </div>
);

TrendChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  chartData: PropTypes.objectOf(PropTypes.any).isRequired,
  config: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default TrendChartCard;
