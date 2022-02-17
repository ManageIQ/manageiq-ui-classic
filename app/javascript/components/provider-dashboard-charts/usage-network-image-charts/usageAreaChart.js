import React from 'react';
import PropTypes from 'prop-types';
import { AreaChart } from '@carbon/charts-react';
import { getConvertedData, getLatestValue } from '../helpers';
import EmptyChart from '../emptyChart';

const UsageAreaChart = ({
  data, config, dataPoint, title,
}) => {
  const usageData = data[dataPoint];
  const areaOptions = {
    title,
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
    toolbar:
    {
      enabled: false,
    },
    height: config.size.height ? config.size.height : '400px',
    resizable: false,
    tooltip: {
      customHTML: config.tooltipFn(data),
    },

  };

  const areaData = getConvertedData(usageData.xy_data, config.createdLabel);

  return (
    <div>
      { (config.valueType === 'actual') && (
        <span>
          <span className="trend-title-big-pf">
            {' '}
            {getLatestValue(usageData.xy_data)}
          </span>
          {' '}
          <span className="trend-title-small-pf">
            {' '}
            {config.units}
          </span>
        </span>
      )}
      {usageData.xy_data.dataAvailable ? <AreaChart data={areaData} options={areaOptions} /> : <EmptyChart />}
      <span className={`trend-footer-pf ${!usageData.xy_data.dataAvailable ? 'chart-transparent-text' : ''}`}>{config.timeFrame}</span>
    </div>
  );
};

UsageAreaChart.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  dataPoint: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  config: PropTypes.shape({
    units: PropTypes.string.isRequired,
    timeFrame: PropTypes.string.isRequired,
    valueType: PropTypes.string,
    createdLabel: PropTypes.string.isRequired,
    tooltipFn: PropTypes.func.isRequired,
    size: PropTypes.shape({
      height: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default UsageAreaChart;
