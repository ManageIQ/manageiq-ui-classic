import React from 'react';
import PropTypes from 'prop-types';
import {
  AreaChartGraph, DonutChartGraph, GroupBarChart, LineChartGraph, PieChartGraph,
  StackAreaChart, StackBarChartGraph, StackHorizontalChart,
} from '../../carbon-charts';
import { getConvertedData } from '../../carbon-charts/helpers';
import EmptyChart from './emptyChart';

// eslint-disable-next-line no-unused-vars
const DashboardWidget = ({ data, id, title }) => {
  const convertedData = getConvertedData(data);
  let showLegend = true;
  const nameTable = data.miq.name_table;
  if (convertedData.length > 0 && data.miq) {
    if (!nameTable) {
      showLegend = false;
    } else {
      const keys = Object.keys(nameTable);
      if (keys.length === 1 && nameTable[keys[0]] === 'Unknown') {
        showLegend = false;
      }
    }
  }

  if (convertedData.length > 0) {
    if (data.miqChart === 'Area') {
      return (<AreaChartGraph data={convertedData} title={title} />);
    }
    if (data.miqChart === 'Donut') {
      return (<DonutChartGraph data={convertedData} title={title} />);
    }
    if (data.miqChart === 'Line') {
      return (<LineChartGraph data={convertedData} title={title} />);
    }
    if (data.miqChart === 'Pie') {
      return (<PieChartGraph data={convertedData} title={title} />);
    }
    if (data.miqChart === 'StackedArea') {
      return (<StackAreaChart data={convertedData} title={title} />);
    }
    if (data.miqChart === 'StackedBar' && data.data.groups) {
      return (<StackHorizontalChart data={convertedData} title={title} />);
    }
    if ((data.miqChart === 'StackedColumn' || data.miqChart === 'Column') && data.data.groups) {
      return (<StackBarChartGraph data={convertedData} title={title} />);
    }
    if ((data.miqChart === 'StackedColumn' || data.miqChart === 'Column') && !data.data.groups) {
      return (<GroupBarChart data={convertedData} title={title} showLegend={showLegend} />);
    }
    return (<StackBarChartGraph data={convertedData} title={title} />);
  }
  return <EmptyChart />;
};

DashboardWidget.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  id: PropTypes.string,
  title: PropTypes.string,
};

DashboardWidget.defaultProps = {
  data: null,
  id: null,
  title: null,
};

export default DashboardWidget;
