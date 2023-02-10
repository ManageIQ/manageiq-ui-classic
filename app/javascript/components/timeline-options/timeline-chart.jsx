import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { LineChart } from '@carbon/charts-react';
import { timelineUiOptions } from './timeline-helper';

const TimelineChart = ({ data, title, buildTableData }) => {
  const chartRef = useRef(null);
  const chartOnClick = ({ detail }) => buildTableData(detail.datum);

  useEffect(() => {
    chartRef.current.chart.services.events.addEventListener(
      'scatter-click',
      chartOnClick
    );
  }, [chartRef]);

  // Unmount
  useEffect(
    () => () => {
      if (chartRef.current) {
        chartRef.current.chart.services.events.removeEventListener(
          'scatter-click',
          chartOnClick
        );
      }
    },
    []
  );

  const LengthWarning = (
    <label className="bx--label">
      {__('*Only 5000 events shown. Limit date range to avoid \"missing\" events.')}
    </label>
  );

  return (
    <div>
      {data.length >= 5000 && LengthWarning}
      <LineChart className="line_charts" data={data} options={timelineUiOptions(title)} ref={chartRef} />
    </div>
  );
};

TimelineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
  title: PropTypes.string,
  buildTableData: PropTypes.func,
};

TimelineChart.defaultProps = {
  data: [],
  title: '',
  buildTableData: () => {},
};

export default TimelineChart;
