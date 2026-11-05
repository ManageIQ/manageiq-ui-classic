import PropTypes from 'prop-types';
import { LineChart } from '@carbon/charts-react';

const LineChartGraph = ({
  data = null,
  title = '',
  dualYAxis = null,
}) => {
  const options = {
    title,
    axes: {
      bottom: {
        mapsTo: 'key',
        scaleType: 'labels',
      },
      left: {
        mapsTo: 'value',
        scaleType: 'linear',
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
    <LineChart data={data} options={options} />
  );
};

LineChartGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
  title: PropTypes.string,
  dualYAxis: PropTypes.shape({
    mapsTo: PropTypes.string.isRequired,
    title: PropTypes.string,
    correspondingDatasets: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
};

export default LineChartGraph;
