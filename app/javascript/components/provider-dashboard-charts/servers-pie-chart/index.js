import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ServersAvailablePieChart from './serversAvailablePieChart';
import ServersHealthPieChart from './serversHealthPieChart';
import { http } from '../../../http_api';
import { chartConfig } from '../charts_config';
import EmptyChart from '../emptyChart';

const ServersDataChart = ({
  providerId, serversAvailableConfig, serversHealthConfig, title, apiUrl,
}) => {
  const [data, setCardData] = useState({ loading: true });

  useEffect(() => {
    const url = `/${apiUrl}/${providerId}`;
    http.get(url)
      .then((response) => {
        setCardData({
          loading: false,
          vms: response.data.serversGroup,
        });
      });
  }, []);

  if (data.loading) return null;

  const processMetricsData = (data) => {
    let a = {};
    if (data) {
      const keys = Object.keys(data);
      keys.forEach((item, i) => {
        if (data[item] === null) {
          a[keys[i]] = { dataAvailable: false };
          a[keys[i]].data = [];
        } else {
          a[keys[i]] = { dataAvailable: true };
          a[keys[i]].data = data[item];
        }
      });
      a.dataAvailable = true;
    } else {
      a = { dataAvailable: false };
    }
    return a;
  };

  const processData = processMetricsData(data.vms);

  return (
    <div className="card-pf card-pf-utilization">
      <div className="card-pf-heading">
        <h2 className="card-pf-title">{title}</h2>
      </div>
      <div className="row">
        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-6 example-trend-container">
          {processData.availableServers.dataAvailable
            ? <ServersAvailablePieChart data={processData.availableServers} config={chartConfig[serversAvailableConfig]} />
            : <EmptyChart />}
        </div>
        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-6 example-trend-container">
          {processData.serversHealth.dataAvailable
            ? <ServersHealthPieChart data={processData.serversHealth} config={chartConfig[serversHealthConfig]} /> : <EmptyChart />}
        </div>
      </div>
    </div>
  );
};

ServersDataChart.propTypes = {
  providerId: PropTypes.string.isRequired,
  serversAvailableConfig: PropTypes.string.isRequired,
  serversHealthConfig: PropTypes.string.isRequired,
  apiUrl: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default ServersDataChart;
