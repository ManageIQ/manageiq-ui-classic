import React from 'react';
import PropTypes from 'prop-types';
import { StackedAreaChart } from '@carbon/charts-react';

const StackAreaChart = ({ data }) => {
  const options = {
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
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.array,
};

StackAreaChart.defaultProps = {
  data: null,
};

export default StackAreaChart;
