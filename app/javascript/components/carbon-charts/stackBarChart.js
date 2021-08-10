import React from 'react';
import PropTypes from 'prop-types';
import { StackedBarChart } from '@carbon/charts-react';

const StackBarChartGraph = ({ data }) => {
  const options = {
    axes: {
      left: {
        mapsTo: 'value',
        stacked: true,
      },
      bottom: {
        mapsTo: 'key',
        scaleType: 'labels',
      },
    },
    height: '400px',
    tooltip: {
      truncation: {
        type: 'none',
      },
    },
    toolbar:
    {
      enabled: false,
    },
  };

  return (
    <StackedBarChart data={data} options={options} />
  );
};

StackBarChartGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
};

StackBarChartGraph.defaultProps = {
  data: null,
};

export default StackBarChartGraph;
