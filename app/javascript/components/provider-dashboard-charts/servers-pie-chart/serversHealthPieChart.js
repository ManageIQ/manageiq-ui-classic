import React from 'react';
import PropTypes from 'prop-types';
import { PieChart } from '@carbon/charts-react';
import EmptyChart from '../emptyChart';
import { chartConfig } from '../charts_config';

const ServersHealthPieChart = ({ data, config }) => {
  const pieChartData = [
    {
      group: __('Valid'),
      value: data.data.columns.valid,
    },
    {
      group: __('Warning'),
      value: data.data.columns.warning,
    },
    {
      group: __('Critical'),
      value: data.data.columns.critical,
    },
  ];

  const PieOptions = {
    height: '230px',
    resizable: true,
    color: {
      scale: chartConfig.serversHealthUsagePieConfig.color,
    },
    tooltip: {
      truncation: {
        type: 'none',
      },
    },
    legend: {
      enabled: true,
      alignment: 'right',
    },
  };

  return (
    <div>
      <div className="utilization-trend-chart-pf">
        <h3>{config.title}</h3>
        <div className="current-values" />
      </div>
      {data.dataAvailable ? <PieChart data={pieChartData} options={PieOptions} /> : <EmptyChart />}
      <span className="trend-footer-pf">{config.legendLeftText}</span>
    </div>
  );
};

ServersHealthPieChart.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  config: PropTypes.shape({
    legendLeftText: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    units: PropTypes.string.isRequired,
  }).isRequired,
};

export default ServersHealthPieChart;
