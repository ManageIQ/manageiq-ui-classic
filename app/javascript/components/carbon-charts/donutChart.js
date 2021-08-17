import React from 'react';
import PropTypes from 'prop-types';
import { DonutChart } from '@carbon/charts-react';

const DonutChartGraph = ({ data }) => {
  const options = {
    donut: {
      center: {
        label: __('Total'),
      },
    },
    height: '400px',
    resizable: true,
    tooltip: {
      truncation: {
        type: 'none',
      },
    },
  };

  return (
    <DonutChart data={data} options={options} />
  );
};

DonutChartGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
};

DonutChartGraph.defaultProps = {
  data: null,
};

export default DonutChartGraph;
