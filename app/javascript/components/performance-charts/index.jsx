import React from 'react';
import PropTypes from 'prop-types';
import LineChartGraph from './lineChart';
import AreaChartGraph from './areaChart';
import GroupBarChart from './groupChart';
import { getConvertedData, getLineConvertedData } from '../carbon-charts/helpers';
import EmptyChart from '../dashboard-charts/emptyChart';

const PerformanceChartWidget = ({
  // eslint-disable-next-line no-unused-vars
  data, id, size, title,
}) => {
  let convertedData = getLineConvertedData(data);
  if (data.miq && data.miq.empty) {
    return (<EmptyChart />);
  }
  if (data.miqChart === 'Area') {
    return (<AreaChartGraph data={convertedData} format={data.miq.format} size={size} title={title} />);
  }
  if ((data.miqChart === 'StackedColumn' || data.miqChart === 'Column') && !data.data.groups) {
    convertedData = getConvertedData(data);
    return (<GroupBarChart data={convertedData} format={data.miq.format} size={size} title={title} />);
  }
  return (<LineChartGraph data={convertedData} format={data.miq.format} size={size} title={title} />);
};

PerformanceChartWidget.propTypes = {
  data: PropTypes.instanceOf(Object),
  id: PropTypes.string,
  size: PropTypes.string,
  title: PropTypes.string,
};

PerformanceChartWidget.defaultProps = {
  data: null,
  id: null,
  size: '400px',
  title: '',
};

export default PerformanceChartWidget;
