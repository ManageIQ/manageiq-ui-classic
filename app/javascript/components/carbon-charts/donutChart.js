import React from 'react';
import PropTypes from 'prop-types';
import { DonutChart } from '@carbon/charts-react';

const DonutChartGraph = ({ data, title }) => {
  const options = {
    title,
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
  title: PropTypes.string,
};

DonutChartGraph.defaultProps = {
  data: null,
  title: '',
};

export default DonutChartGraph;
