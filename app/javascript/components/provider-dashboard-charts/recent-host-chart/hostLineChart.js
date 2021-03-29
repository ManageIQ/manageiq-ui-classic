import React from 'react';
import PropTypes from 'prop-types';
import { LineChart } from '@carbon/charts-react';
import { getConvertedData } from '../helpers';
import EmptyChart from '../emptyChart';

const HostLineChart = ({ data, config }) => {
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
      enabled: true,
      alignment: 'center',

    },
    height: config.size.height,
    tooltip: {
      customHTML: config.tooltipFn(data),
    },

  };

  const lineData = getConvertedData(data, config.units);

  return (
    <div>
      {data.dataAvailable ? <LineChart data={lineData} options={areaOptions} /> : <EmptyChart />}
      <span className={`trend-footer-pf ${!data.dataAvailable ? 'chart-transparent-text' : ''}`}>{config.legendLeftText}</span>
    </div>
  );
};

HostLineChart.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  config: PropTypes.shape({
    legendLeftText: PropTypes.string.isRequired,
    units: PropTypes.string.isRequired,
    tooltipFn: PropTypes.func.isRequired,
    size: PropTypes.shape({
      height: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default HostLineChart;
