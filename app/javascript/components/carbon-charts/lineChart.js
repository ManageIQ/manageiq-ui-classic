import React from 'react';
import PropTypes from 'prop-types';
import { LineChart } from '@carbon/charts-react';

const LineChartGraph = ({ data, title }) => {
  const options = {
    title,
    axes: {
      bottom: {
        mapsTo: 'key',
        scaleType: 'labels',
      },
      left: {
        mapsTo: 'value',
        scaleType: 'linear',
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
    <LineChart data={data} options={options} />
  );
};

LineChartGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
  title: PropTypes.string,
};

LineChartGraph.defaultProps = {
  data: null,
  title: '',
};

export default LineChartGraph;
