import React from 'react';
import PropTypes from 'prop-types';
import LineChartGraph from './lineChart';
import { getLineConvertedData } from '../carbon-charts/helpers';

const PerformanceChartWidget = ({ data, id }) => {
  const convertedData = getLineConvertedData(data);

  return (<LineChartGraph data={convertedData} format={data.miq.format} />);
};

PerformanceChartWidget.propTypes = {
  data: PropTypes.object,
  id: PropTypes.string,
};

PerformanceChartWidget.defaultProps = {
  data: null,
  id: null,
};

export default PerformanceChartWidget;
