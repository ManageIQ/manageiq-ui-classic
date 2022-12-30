import React from 'react';
import PropTypes from 'prop-types';
import { LineChart } from '@carbon/charts-react';
import { getConvertedData } from '../helpers';
import EmptyChart from '../emptyChart';

const HostLineChart = ({ data, config }) => {
  const areaOptions = {
    title: data.config.title,
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
    height: config.size.height || '150px',
    tooltip: {
      customHTML: config.tooltipFn(data),
    },

  };

  const lineData = getConvertedData(data, config.units);

  return (
    <div className='host_line_charts_section'>
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
      height: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default HostLineChart;
