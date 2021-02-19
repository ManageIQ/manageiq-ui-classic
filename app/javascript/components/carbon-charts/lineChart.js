import React from 'react';
import PropTypes from 'prop-types';
import { LineChart } from '@carbon/charts-react';

const LineChartGraph = ({ data }) => {
  const options = {
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
  data: PropTypes.array,
};

LineChartGraph.defaultProps = {
  data: null,
};

export default LineChartGraph;
