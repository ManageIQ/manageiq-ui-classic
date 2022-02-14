import React from 'react';
import PropTypes from 'prop-types';
import { GroupedBarChart } from '@carbon/charts-react';

const GroupBarChart = ({ data, title }) => {
  const options = {
    title,
    axes: {
      left: {
        mapsTo: 'value',
      },
      bottom: {
        scaleType: 'labels',
        mapsTo: 'key',
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

GroupBarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
  title: PropTypes.string,
};

GroupBarChart.defaultProps = {
  data: null,
  title: '',
};

export default GroupBarChart;
