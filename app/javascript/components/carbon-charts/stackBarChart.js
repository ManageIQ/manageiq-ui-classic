import PropTypes from 'prop-types';
import { StackedBarChart } from '@carbon/charts-react';

const StackBarChartGraph = ({
  data = null,
  title = '',
  chart_options = null,
  dualYAxis = null,
}) => {
  const options = {
    title,
    axes: {
      left: {
        mapsTo: 'value',
        stacked: true,
      },
      bottom: {
        mapsTo: 'key',
        scaleType: 'labels',
      },
      ...(dualYAxis && {
        right: {
          mapsTo: dualYAxis.mapsTo,
          scaleType: 'linear',
          title: dualYAxis.title,
          correspondingDatasets: dualYAxis.correspondingDatasets,
        },
      }),
    },
    height: '400px',
    tooltip: {
      truncation: {
        type: 'none',
      },
    },
  };

  return (
    <StackedBarChart data={data} options={chart_options ? chart_options : options} />
  );
};

StackBarChartGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
  title: PropTypes.string,
  dualYAxis: PropTypes.shape({
    mapsTo: PropTypes.string.isRequired,
    title: PropTypes.string,
    correspondingDatasets: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
};

export default StackBarChartGraph;
