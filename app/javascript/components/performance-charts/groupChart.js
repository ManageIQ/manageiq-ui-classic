import PropTypes from 'prop-types';
import { GroupedBarChart } from '@carbon/charts-react';
import { getYAxisValue } from './helpers';

const GroupBarChart = ({
  data = null,
  format = null,
  size = '400px',
  title = '',
}) => {
  const options = {
    title,
    axes: {
      left: {
        title: __('Value'),
        mapsTo: 'value',
        ticks: {
          formatter(n) { return getYAxisValue(format, n); },
        },
      },
      bottom: {
        title: __('Date'),
        scaleType: 'labels',
        mapsTo: 'key',
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
    <GroupedBarChart data={data} options={options} />
  );
};

GroupBarChart.propTypes = {
  data: PropTypes.instanceOf(Array),
  format: PropTypes.instanceOf(Object),
  size: PropTypes.string,
  title: PropTypes.string,
};

export default GroupBarChart;
