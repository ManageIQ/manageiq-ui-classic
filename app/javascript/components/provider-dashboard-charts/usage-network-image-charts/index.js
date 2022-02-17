import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import UsageAreaChart from './usageAreaChart';
import { http } from '../../../http_api';
import { chartConfig } from '../charts_config';
import EmptyChart from '../emptyChart';

const UsageTrendChart = ({
  providerId, config, apiUrl, dataPoint,
}) => {
  const [data, setCardData] = useState({ loading: true });

  useEffect(() => {
    const url = `/${apiUrl}/${providerId}`;
    http.get(url)
      .then((response) => {
        setCardData({
          loading: false,
          vms: response.data,
        });
      });
  }, []);

  if (data.loading) return null;

  const resultData = data.vms;
  const configName = resultData[dataPoint].interval_name + config;
  const title = chartConfig[configName] ? chartConfig[configName].headTitle : __('New Image Usage Trend');
  return (
    <div className="card-pf card-pf-utilization">
      <div className="card-pf-heading">
        <h2 className="card-pf-title">{title}</h2>
      </div>
      <div className="card-pf-body">
        {resultData[dataPoint].dataAvailable ? <UsageAreaChart data={data.vms} config={chartConfig[configName]} dataPoint={dataPoint} title={title} />
          : <EmptyChart /> }
      </div>
    </div>
  );
};

UsageTrendChart.propTypes = {
  providerId: PropTypes.string.isRequired,
  config: PropTypes.string.isRequired,
  apiUrl: PropTypes.string.isRequired,
  dataPoint: PropTypes.string.isRequired,
};

export default UsageTrendChart;
