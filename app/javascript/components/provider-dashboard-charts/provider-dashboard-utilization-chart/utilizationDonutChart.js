import React from 'react';
import PropTypes from 'prop-types';
import { DonutChart, AreaChart } from '@carbon/charts-react';
import { getConvertedData } from '../helpers';
import EmptyChart from '../emptyChart';

const UtilizationDonutChart = ({ data, config }) => {
  const cpuData = data.cpu ? data.cpu : data.xy_data.cpu;
  const donutChartData = [
    {
      group: config.usageDataName,
      value: cpuData.used,
    },
    {
      group: config.availableDataName,
      value: cpuData.total - cpuData.used,
    },
  ];

  const donutOptions = {
    donut: {
      center: {
        label: __('Cores Used'),
        number: cpuData.used,
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
    toolbar:
    {
      enabled: false,
    },
    height: '150px',
    tooltip: {
      customHTML: config.sparklineTooltip(data),
    },

  };

  const areaChartData = getConvertedData(cpuData, config.units);

  return (
    <div>
      <div className="utilization-trend-chart-pf">
        <h3>{config.title}</h3>
        <div className="current-values">
          <h1 className="available-count pull-left">
            {cpuData.total - cpuData.used}
          </h1>
          <div className="available-text pull-left">
            <span>
              {config.availableof}
              {''}
              <span className="available-text-total">{cpuData.total}</span>
              <span className="available-text-total">{config.units}</span>
            </span>
          </div>
        </div>
      </div>
      {cpuData.dataAvailable ? (
        <div>
          <DonutChart data={donutChartData} options={donutOptions} />
          <div className="sparkline-chart">
            <AreaChart data={areaChartData} options={areaOptions} />
          </div>
        </div>
      ) : <EmptyChart />}
      <span className={`trend-footer-pf ${!cpuData.dataAvailable ? 'chart-transparent-text' : ''}`}>{config.legendLeftText}</span>
    </div>

  );
  // }
};

UtilizationDonutChart.propTypes = {
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

export default UtilizationDonutChart;
