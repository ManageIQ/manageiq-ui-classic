import React from 'react';
import PropTypes from 'prop-types';
import { MeterChart } from '@carbon/charts-react';
import { Loading } from 'carbon-components-react';
import EmptyCard from './empty-card';
import BarChartCard from './bar-chart-card';
import TrendChartCard from './trend-chart-card';
import TableCard from './table-card';
import AreaChartCard from './area-chart-card';

const ChartCard = ({
  chartType, title, textNumber, textUnit, textTitle, chartData, options, isLoading, config,
}) => {
  if (isLoading) {
    return (
      <div className="card-pf card-pf-aggregate-status card-pf-accented chart-card">
        <h2 className="card-title">
          {title}
        </h2>
        <div className="card-pf-body">
          <Loading className="export-spinner" withOverlay={false} small />
        </div>
      </div>
    );
  }
  if (chartType === 'empty') {
    return (
      <EmptyCard title={title} />
    );
  }
  if (chartType === 'quotas') {
    const quotaCharts = [];
    chartData.forEach((resource) => {
      const usedAmount = resource.quota_observed / resource.quota_enforced;
      const chartData = [{
        group: sprintf(__(`%s - %s %s Used`), resource.resource, resource.quota_observed, resource.units),
        value: usedAmount * 100,
      }];
      const options = {
        meter: {
          status: {
            ranges: [
              {
                range: [0, resource.quota_enforced],
              },
            ],
          },
        },
        toolbar: {
          enabled: false,
        },
        height: '75px',
      };
      quotaCharts.push(
        <div className="quota-chart" key={resource.resource}>
          <MeterChart data={chartData} options={options} />
        </div>
      );
    });
    return (
      <BarChartCard title={title} chartData={quotaCharts} />
    );
  }
  if (chartType === 'podsTrend') {
    return (
      <TrendChartCard title={title} chartData={chartData} config={config} />
    );
  }
  if (chartType === 'table') {
    return (
      <TableCard title={title} chartData={chartData} />
    );
  }
  return (
    <AreaChartCard title={title} textNumber={textNumber} textUnit={textUnit} textTitle={textTitle} chartData={chartData} options={options} />
  );
};

ChartCard.propTypes = {
  chartType: PropTypes.string,
  title: PropTypes.string.isRequired,
  textNumber: PropTypes.number,
  textUnit: PropTypes.string,
  textTitle: PropTypes.string,
  chartData: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.any), PropTypes.objectOf(PropTypes.any)]),
  options: PropTypes.objectOf(PropTypes.any),
  isLoading: PropTypes.bool,
  config: PropTypes.objectOf(PropTypes.any),
};

ChartCard.defaultProps = {
  chartType: '',
  textNumber: undefined,
  textUnit: undefined,
  textTitle: undefined,
  chartData: [],
  options: {},
  isLoading: false,
  config: {},
};

export default ChartCard;
