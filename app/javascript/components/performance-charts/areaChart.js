import PropTypes from 'prop-types';
import { AreaChart } from '@carbon/charts-react';
import { getTickFormatter, getTooltipOptions } from './helpers';

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
          formatter: getTickFormatter(format),
        },
      },
    },
    height: size,
    tooltip: getTooltipOptions(format),
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
