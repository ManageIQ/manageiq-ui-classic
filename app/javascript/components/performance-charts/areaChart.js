import React from 'react';
import PropTypes from 'prop-types';
import { AreaChart } from '@carbon/charts-react';

const AreaChartGraph = ({ data, format, size }) => {
  const getYAxisValue = (format, value) => {
    // eslint-disable-next-line no-useless-escape
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
    height: size,
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
  data: PropTypes.instanceOf(Array),
  format: PropTypes.instanceOf(Object),
  size: PropTypes.string,
};

AreaChartGraph.defaultProps = {
  data: null,
  format: null,
  size: '400px',
};

export default AreaChartGraph;
