import React from 'react';
import PropTypes from 'prop-types';
import { LineChart } from '@carbon/charts-react';

const LineChartGraph = ({ data, format }) => {
  const getYAxisValue = (format, value) => {
    const tmp = /^([0-9\,\.]+)(.*)/.exec(ManageIQ.charts.formatters[format.function].c3(format.options)(value));
    return [`${numeral(tmp[1]).value()}${tmp[2]}`];
  };

  const options = {
    axes: {
      bottom: {
        mapsTo: 'key',
        scaleType: 'linear',
      },
      left: {
        mapsTo: 'value',
        scaleType: 'linear',
        ticks: {
          formatter(n) { return getYAxisValue(format, n); },
        },
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
  format: PropTypes.object,
};

LineChartGraph.defaultProps = {
  data: null,
  format: null,
};

export default LineChartGraph;
