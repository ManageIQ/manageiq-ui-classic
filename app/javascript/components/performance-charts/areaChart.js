import React from 'react';
import PropTypes from 'prop-types';
import { AreaChart } from '@carbon/charts-react';
import { getYAxisValue } from './helpers';

const AreaChartGraph = ({
  data, format, size, title,
}) => {
  const options = {
    title,
    axes: {
      bottom: {
        mapsTo: 'key',
        scaleType: 'linear',
      },
      left: {
        mapsTo: 'value',
        scaleType: 'linear',
        ticks: {
          formatter(n) { return getYAxisValue(format, n); },
        },
      },
    },
    height: size,
    tooltip: {
      truncation: {
        type: 'none',
      },
    },
  };

  return (
    <AreaChart data={data} options={options} />
  );
};

AreaChartGraph.propTypes = {
  data: PropTypes.instanceOf(Array),
  format: PropTypes.instanceOf(Object),
  size: PropTypes.string,
  title: PropTypes.string,
};

AreaChartGraph.defaultProps = {
  data: null,
  format: null,
  size: '400px',
  title: '',
};

export default AreaChartGraph;
