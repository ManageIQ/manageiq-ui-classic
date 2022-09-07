import React from 'react';
import PropTypes from 'prop-types';
import { PieChart } from '@carbon/charts-react';
import EmptyChart from '../emptyChart';

const ServersAvailablePieChart = ({ data, config }) => {
  const pieChartData = [
    {
      group: config.usageDataName,
      value: data.data.columns.used,
    },
    {
      group: config.availableDataName,
      value: data.data.columns.available,
    },
  ];

  const PieOptions = {
    height: '230px',
    resizable: true,
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
    <div className='servers_available_pie_chart_section'>
      <div className="utilization-trend-chart-pf">
        <h3>{config.title}</h3>
        <div className="current-values" />
      </div>
      {data.dataAvailable ? <PieChart data={pieChartData} options={PieOptions} /> : <EmptyChart />}
      <span className="trend-footer-pf">{config.legendLeftText}</span>
    </div>
  );
};

ServersAvailablePieChart.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  config: PropTypes.shape({
    availableDataName: PropTypes.string.isRequired,
    legendLeftText: PropTypes.string.isRequired,
    usageDataName: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    units: PropTypes.string.isRequired,
  }).isRequired,
};

export default ServersAvailablePieChart;
