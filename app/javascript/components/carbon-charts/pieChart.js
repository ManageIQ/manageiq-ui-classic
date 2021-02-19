import React from 'react';
import PropTypes from 'prop-types';
import { PieChart } from '@carbon/charts-react';

const PieChartGraph = ({ data }) => {
  const options = {
    resizable: true,
    height: '400px',
    tooltip: {
      truncation: {
        type: 'none',
      },
    },
  };

  return (
    <PieChart data={data} options={options} />
  );
};

PieChartGraph.propTypes = {
  data: PropTypes.array,
};

PieChartGraph.defaultProps = {
  data: null,
};

export default PieChartGraph;
