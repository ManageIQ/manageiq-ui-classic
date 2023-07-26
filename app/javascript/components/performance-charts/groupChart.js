import React from 'react';
import PropTypes from 'prop-types';
import { GroupedBarChart } from '@carbon/charts-react';
import { getYAxisValue } from './helpers';

const GroupBarChart = ({
  data, format, size, title,
}) => {
  const options = {
    title,
    axes: {
      left: {
        mapsTo: 'value',
        ticks: {
          formatter(n) { return getYAxisValue(format, n); },
        },
      },
      bottom: {
        scaleType: 'labels',
        mapsTo: 'key',
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
    <GroupedBarChart data={data} options={options} />
  );
};

GroupBarChart.propTypes = {
  data: PropTypes.instanceOf(Array),
  format: PropTypes.instanceOf(Object),
  size: PropTypes.string,
  title: PropTypes.string,
};

GroupBarChart.defaultProps = {
  data: null,
  format: null,
  size: '400px',
  title: '',
};

export default GroupBarChart;
