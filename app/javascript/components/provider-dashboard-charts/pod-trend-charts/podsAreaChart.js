import React from 'react';
import PropTypes from 'prop-types';
import { AreaChart } from '@carbon/charts-react';
import { getPodsData, getLatestValue } from '../helpers';
import EmptyChart from '../emptyChart';

const PodsAreaChart = ({ data, config, dataPoint }) => {
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

  const areaData = getPodsData(usageData.xy_data, config.createdLabel, config.deletedLabel);

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
      {(usageData.xy_data && usageData.xy_data.dataAvailable) ? <AreaChart data={areaData} options={areaOptions} /> : <EmptyChart />}
      <span
        className={`trend-footer-pf ${!(usageData.xy_data && usageData.xy_data.dataAvailable)
          ? 'chart-transparent-text' : ''}`}
      >
        {config.timeFrame}
      </span>
    </div>
  );
};

PodsAreaChart.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  dataPoint: PropTypes.string.isRequired,
  config: PropTypes.shape({
    timeFrame: PropTypes.string.isRequired,
    createdLabel: PropTypes.string.isRequired,
    units: PropTypes.string,
    deletedLabel: PropTypes.string.isRequired,
    tooltipFn: PropTypes.func.isRequired,
    valueType: PropTypes.string,
    size: PropTypes.shape({
      height: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default PodsAreaChart;
