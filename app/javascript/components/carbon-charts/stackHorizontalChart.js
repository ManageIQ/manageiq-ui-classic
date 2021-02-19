import React from 'react';
import PropTypes from 'prop-types';
import { StackedBarChart } from '@carbon/charts-react';

const StackHorizontalChart = ({ data }) => {
  const options = {
    axes: {
      left: {
        scaleType: 'labels',
      },
      bottom: {
        stacked: true,
      },
    },
    height: '400px',
    tooltip: {
      truncation: {
        type: 'none',
      },
    },
  };

  return (
    <StackedBarChart data={data} options={options} />
  );
};

StackHorizontalChart.propTypes = {
  data: PropTypes.array,
};

StackHorizontalChart.defaultProps = {
  data: null,
};

export default StackHorizontalChart;
