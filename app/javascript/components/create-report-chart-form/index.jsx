import React from 'react';
import PropTypes from 'prop-types';
import {
  AreaChartGraph, DonutChartGraph, GroupBarChart, LineChartGraph, GroupHorizontalBarChart, PieChartGraph,
  StackAreaChart, StackBarChartGraph, StackHorizontalChart,
} from '../carbon-charts';
import { sampleData, pieData } from '../carbon-charts/helpers';

// eslint-disable-next-line no-unused-vars
const ReportChartWidget = ({ data, id }) => {
  if (data.miqChart === 'Area') {
    return (<AreaChartGraph data={sampleData} />);
  }
  if (data.miqChart === 'Bar') {
    return (<GroupHorizontalBarChart data={sampleData} />);
  }
  if (data.miqChart === 'Column') {
    return (<GroupBarChart data={sampleData} />);
  }
  if (data.miqChart === 'Donut') {
    return (<DonutChartGraph data={pieData} />);
  }
  if (data.miqChart === 'Line') {
    return (<LineChartGraph data={sampleData} />);
  }
  if (data.miqChart === 'Pie') {
    return (<PieChartGraph data={pieData} />);
  }
  if (data.miqChart === 'StackedArea') {
    return (<StackAreaChart data={sampleData} />);
  }
  if (data.miqChart === 'StackedBar') {
    return (<StackHorizontalChart data={sampleData} />);
  }
  if (data.miqChart === 'StackedColumn') {
    return (<StackBarChartGraph data={sampleData} />);
  }
  return (<StackBarChartGraph data={sampleData} />);
};

ReportChartWidget.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  id: PropTypes.string,
};

ReportChartWidget.defaultProps = {
  data: null,
  id: null,
};

export default ReportChartWidget;
