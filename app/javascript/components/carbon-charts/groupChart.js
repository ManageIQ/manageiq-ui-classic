import PropTypes from 'prop-types';
import { GroupedBarChart } from '@carbon/charts-react';

const GroupBarChart = ({
  data = null,
  title = '',
  showLegend = true,
  dualYAxis = null,
}) => {
  const options = {
    title,
    legend: { enabled: showLegend },
    axes: {
      left: {
        mapsTo: 'value',
      },
      bottom: {
        scaleType: 'labels',
        mapsTo: 'key',
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
    <GroupedBarChart data={data} options={options} />
  );
};

GroupBarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
  title: PropTypes.string,
  showLegend: PropTypes.bool,
  dualYAxis: PropTypes.shape({
    mapsTo: PropTypes.string.isRequired,
    title: PropTypes.string,
    correspondingDatasets: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
};

export default GroupBarChart;
