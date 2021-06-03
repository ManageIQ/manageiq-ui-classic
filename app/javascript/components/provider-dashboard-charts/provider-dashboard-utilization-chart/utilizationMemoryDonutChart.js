/* eslint-disable react/jsx-curly-brace-presence */
import React from 'react';
import PropTypes from 'prop-types';
import { DonutChart, AreaChart } from '@carbon/charts-react';
import { getConvertedData } from '../helpers';
import EmptyChart from '../emptyChart';

const UtilizationMemoryDonutChart = ({ data, config }) => {
  const memoryData = data.memory ? data.memory : data.xy_data.memory;
  const donutChartData = [
    {
      group: config.usageDataName,
      value: memoryData.used,
    },
    {
      group: config.availableDataName,
      value: memoryData.total - memoryData.used,
    },
  ];

  const donutOptions = {
    donut: {
      center: {
        label: __('GB Used'),
        number: memoryData.used,
      },
    },
    height: '230px',
    resizable: true,
    tooltip: {
      truncation: {
        type: 'none',
      },
    },
  };

  const areaOptions = {
    grid: {
      x: {
        enabled: false,
      },
      y: {
        enabled: false,
      },
    },
    axes: {
      bottom: {
        visible: false,
        mapsTo: 'date',
        scaleType: 'time',
      },
      left: {
        visible: false,
        mapsTo: 'value',
        scaleType: 'linear',
      },
    },
    color: {
      gradient: {
        enabled: true,
      },
    },
    legend: {
      enabled: false,
    },
    height: '60px',
    tooltip: {
      customHTML: config.sparklineTooltip(data),
    },

  };

  const areaChartData = getConvertedData(memoryData, config.units);

  return (
    <div>
      <div className="utilization-trend-chart-pf">
        <h3>{config.title}</h3>
        <div className="current-values">
          <h1 className="available-count pull-left">
            {memoryData.total - memoryData.used}
          </h1>
          <div className="available-text pull-left">
            <span>
              {config.availableof}
              {''}
              <span className="available-text-total">{memoryData.total}</span>
              {''}
              <span className="available-text-total">{config.units}</span>
            </span>
          </div>
        </div>
      </div>
      {memoryData.dataAvailable ? (
        <div>
          <DonutChart data={donutChartData} options={donutOptions} />
          <div className="sparkline-chart">
            <AreaChart data={areaChartData} options={areaOptions} />
          </div>
        </div>
      ) : <EmptyChart />}
      <span className={`trend-footer-pf ${!memoryData.dataAvailable ? 'chart-transparent-text' : ''}`}>{config.legendLeftText}</span>
    </div>
  );
};

UtilizationMemoryDonutChart.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  config: PropTypes.shape({
    legendLeftText: PropTypes.string.isRequired,
    availableof: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    units: PropTypes.string.isRequired,
    usageDataName: PropTypes.string.isRequired,
    availableDataName: PropTypes.string.isRequired,
    sparklineTooltip: PropTypes.func.isRequired,
  }).isRequired,
};

export default UtilizationMemoryDonutChart;
