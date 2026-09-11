import PropTypes from 'prop-types';
import { AreaChart } from '@carbon/charts-react';
import { getYAxisValue } from './helpers';

const AreaChartGraph = ({
  data = null,
  format = null,
  size = '400px',
  title = '',
}) => {
  const options = {
    title,
    axes: {
      bottom: {
        title: __('Date'),
        mapsTo: 'key',
        scaleType: 'time',
      },
      left: {
        title: __('Value'),
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
      valueFormatter(value, label) {
        if (value instanceof Date || label === __('Date') || label === 'x-value') {
          return value instanceof Date
            ? value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : value;
        }
        if (label === 'Group' || label === __('Group')) {
          return value;
        }
        return getYAxisValue(format, value);
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
  title: PropTypes.string,
};

export default AreaChartGraph;
