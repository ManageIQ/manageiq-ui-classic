import React from 'react';
import PropTypes from 'prop-types';
import { AreaChart } from '@carbon/charts-react';
import { getConvertedData } from '../helpers';
import EmptyChart from '../emptyChart';

const VmAreaChart = ({ data, config, dataPoint }) => {
  const usageData = data[dataPoint];
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
    legend: {
      enabled: true,
      alignment: 'center',
    },
    height: config.size.height || '150px',
    tooltip: {
      customHTML: config.tooltipFn(data),
    },

  };

  const areaData = getConvertedData(usageData, config.units);
  return (
    <div>
      {usageData.dataAvailable ? <AreaChart data={areaData} options={areaOptions} /> : <EmptyChart />}
      <span className={`trend-footer-pf ${!usageData.dataAvailable ? 'chart-transparent-text' : ''}`}>{config.legendLeftText}</span>
    </div>
  );
};

VmAreaChart.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  dataPoint: PropTypes.string.isRequired,
  config: PropTypes.shape({
    legendLeftText: PropTypes.string.isRequired,
    units: PropTypes.string.isRequired,
    tooltipFn: PropTypes.func,
    size: PropTypes.shape({
      height: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default VmAreaChart;
