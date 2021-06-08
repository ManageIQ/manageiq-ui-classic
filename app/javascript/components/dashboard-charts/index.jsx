import React from 'react';
import PropTypes from 'prop-types';
import {
  AreaChartGraph, DonutChartGraph, GroupBarChart, LineChartGraph, PieChartGraph,
  StackAreaChart, StackBarChartGraph, StackHorizontalChart,
} from '../carbon-charts';
import { getConvertedData } from '../carbon-charts/helpers';

// eslint-disable-next-line no-unused-vars
const DashboardWidget = ({ data, id }) => {
  const convertedData = getConvertedData(data);

  if (data.miqChart === 'Area') {
    return (<AreaChartGraph data={convertedData} />);
  }
  if (data.miqChart === 'Donut') {
    return (<DonutChartGraph data={convertedData} />);
  }
  if (data.miqChart === 'Line') {
    return (<LineChartGraph data={convertedData} />);
  }
  if (data.miqChart === 'Pie') {
    return (<PieChartGraph data={convertedData} />);
  }
  if (data.miqChart === 'StackedArea') {
    return (<StackAreaChart data={convertedData} />);
  }
  if (data.miqChart === 'StackedBar' && data.data.groups) {
    return (<StackHorizontalChart data={convertedData} />);
  }
  if ((data.miqChart === 'StackedColumn' || data.miqChart === 'Column') && data.data.groups) {
    return (<StackBarChartGraph data={convertedData} />);
  }
  if ((data.miqChart === 'StackedColumn' || data.miqChart === 'Column') && !data.data.groups) {
    return (<GroupBarChart data={convertedData} />);
  }
  return (<StackBarChartGraph data={convertedData} />);
};

DashboardWidget.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  id: PropTypes.string,
};

DashboardWidget.defaultProps = {
  data: null,
  id: null,
};

export default DashboardWidget;
