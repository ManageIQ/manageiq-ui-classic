import React from 'react';
import PropTypes from 'prop-types';
import { StackedBarChart } from '@carbon/charts-react';

const StackHorizontalChart = ({ data, title }) => {
  const options = {
    title,
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
  data: PropTypes.arrayOf(PropTypes.any),
  title: PropTypes.string,
};

StackHorizontalChart.defaultProps = {
  data: null,
  title: '',
};

export default StackHorizontalChart;
