import PropTypes from 'prop-types';
import { GroupedBarChart } from '@carbon/charts-react';
import { getTickFormatter, getTooltipOptions } from './helpers';

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
          formatter: getTickFormatter(format),
        },
      },
      bottom: {
        title: __('Date'),
        scaleType: 'labels',
        mapsTo: 'key',
      },
    },
    height: size,
    tooltip: getTooltipOptions(format),
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
