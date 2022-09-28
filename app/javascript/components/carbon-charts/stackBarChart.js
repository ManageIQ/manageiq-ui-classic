import React from 'react';
import PropTypes from 'prop-types';
import { StackedBarChart } from '@carbon/charts-react';

const StackBarChartGraph = ({ data, title, chart_options=null }) => {
  const options = {
    title,
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
  };

  return (
    <StackedBarChart data={data} options={chart_options ? chart_options : options} />
  );
};

StackBarChartGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
  title: PropTypes.string,
};

StackBarChartGraph.defaultProps = {
  data: null,
  title: '',
};

export default StackBarChartGraph;
