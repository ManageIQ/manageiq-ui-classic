import React from 'react';
import PropTypes from 'prop-types';
import { PieChart } from '@carbon/charts-react';

const PieChartGraph = ({ data, title }) => {
  const options = {
    title,
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
  data: PropTypes.arrayOf(PropTypes.any),
  title: PropTypes.string,
};

PieChartGraph.defaultProps = {
  data: null,
  title: '',
};

export default PieChartGraph;
