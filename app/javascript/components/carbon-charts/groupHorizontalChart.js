import React from 'react';
import PropTypes from 'prop-types';
import { GroupedBarChart } from '@carbon/charts-react';

const GroupHorizontalBarChart = ({ data, title }) => {
  const options = {
    title,
    axes: {
      left: {
        scaleType: 'labels',
        mapsTo: 'key',
      },
      bottom: {
        mapsTo: 'value',
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
    <GroupedBarChart data={data} options={options} />
  );
};

GroupHorizontalBarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
  title: PropTypes.string,
};

GroupHorizontalBarChart.defaultProps = {
  data: null,
  title: '',
};

export default GroupHorizontalBarChart;
