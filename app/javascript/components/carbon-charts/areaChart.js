import React from 'react';
import PropTypes from 'prop-types';
import { AreaChart } from '@carbon/charts-react';

const AreaChartGraph = ({ data }) => {
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
    <AreaChart data={data} options={options} />
  );
};

AreaChartGraph.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.array,
};

AreaChartGraph.defaultProps = {
  data: null,
};

export default AreaChartGraph;
