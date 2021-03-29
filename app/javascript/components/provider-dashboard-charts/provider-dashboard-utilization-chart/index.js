import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import UtilizationDonutChart from './utilizationDonutChart';
import UtilizationMemoryDonutChart from './utilizationMemoryDonutChart';
import { chartConfig } from '../charts_config';
import { http } from '../../../http_api';
import EmptyChart from '../emptyChart';

const UtilizationChartGraph = ({
  providerId, title, cpuConfig, memoryConfig, dashboard,
}) => {
  const [data, setCardData] = useState({ loading: true });

  useEffect(() => {
    const url = `/${dashboard}/ems_utilization_data/${providerId}`;
    http.get(url)
      .then((response) => {
        setCardData({
          loading: false,
          metricsData: response.data.ems_utilization,
        });
      });
  }, []);

  const processMetricsData = (metrics) => {
    let a = {};
    if (metrics) {
      const data = metrics.xy_data ? metrics.xy_data : metrics;
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

  const processData = processMetricsData(data.metricsData);

  if (data.loading) return null;
  if (!processData.dataAvailable) return <EmptyChart />;

  return (
    <div className="card-pf card-pf-utilization">
      <div className="card-pf-heading">
        <h2 className="card-pf-title">{title}</h2>
      </div>
      <div className="card-pf-body">
        <div className="row">
          <div className="col-xs-12 col-sm-12 col-md-12 col-lg-6 example-trend-container">
            {processData.cpu.dataAvailable ? <UtilizationDonutChart data={data.metricsData} config={chartConfig[cpuConfig]} />
              : <EmptyChart />}
          </div>
          <div className="col-xs-12 col-sm-12 col-md-12 col-lg-6 example-trend-container">
            {processData.memory.dataAvailable ? <UtilizationMemoryDonutChart data={data.metricsData} config={chartConfig[memoryConfig]} />
              : <EmptyChart />}
          </div>
        </div>
      </div>
    </div>
  );
};

UtilizationChartGraph.propTypes = {
  providerId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  cpuConfig: PropTypes.string.isRequired,
  memoryConfig: PropTypes.string.isRequired,
  dashboard: PropTypes.string.isRequired,
};

export default UtilizationChartGraph;
