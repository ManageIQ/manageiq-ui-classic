import React from 'react';
import PropTypes from 'prop-types';
import { LineChart } from '@carbon/charts-react';
import { getYAxisValue } from './helpers';

const LineChartGraph = ({
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
    <LineChart data={data} options={options} />
  );
};

LineChartGraph.propTypes = {
  data: PropTypes.instanceOf(Array),
  format: PropTypes.instanceOf(Object),
  size: PropTypes.string,
  title: PropTypes.string,
};

LineChartGraph.defaultProps = {
  data: null,
  format: null,
  size: '400px',
  title: '',
};

export default LineChartGraph;
