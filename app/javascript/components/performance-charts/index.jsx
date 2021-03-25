import React from 'react';
import PropTypes from 'prop-types';
import LineChartGraph from './lineChart';
import AreaChartGraph from './areaChart';
import { getLineConvertedData } from '../carbon-charts/helpers';

const PerformanceChartWidget = ({ data, id, size }) => {
  const convertedData = getLineConvertedData(data);

  if (data.miqChart === 'Area') {
    return (<AreaChartGraph data={convertedData} format={data.miq.format} size={size} />);
  }
  return (<LineChartGraph data={convertedData} format={data.miq.format} size={size} />);
};

PerformanceChartWidget.propTypes = {
  data: PropTypes.instanceOf(Object),
  id: PropTypes.string,
  size: PropTypes.string,
};

PerformanceChartWidget.defaultProps = {
  data: null,
  id: null,
  size: '400px',
};

export default PerformanceChartWidget;
