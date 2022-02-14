import React from 'react';
import PropTypes from 'prop-types';
import { AreaChart } from '@carbon/charts-react';

const AreaChartGraph = ({ data, title }) => {
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
    <AreaChart data={data} options={options} />
  );
};

AreaChartGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
  title: PropTypes.string,
};

AreaChartGraph.defaultProps = {
  data: null,
  title: '',
};

export default AreaChartGraph;
