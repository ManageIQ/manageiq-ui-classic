import React from 'react';
import PropTypes from 'prop-types';
import { StackedAreaChart } from '@carbon/charts-react';

const StackAreaChart = ({ data, title }) => {
  const options = {
    title,
    axes: {
      left: {
        stacked: true,
        scaleType: 'linear',
        mapsTo: 'value',
      },
      bottom: {
        scaleType: 'linear',
        mapsTo: 'key',
      },
    },
    curve: 'curveMonotoneX',
    height: '400px',
    tooltip: {
      truncation: {
        type: 'none',
      },
    },
  };

  return (
    <StackedAreaChart data={data} options={options} />
  );
};

StackAreaChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
  title: PropTypes.string,
};

StackAreaChart.defaultProps = {
  data: null,
  title: '',
};

export default StackAreaChart;
