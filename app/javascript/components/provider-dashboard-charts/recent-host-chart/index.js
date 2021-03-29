import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import HostLineChart from './hostLineChart';
import { http } from '../../../http_api';
import { chartConfig } from '../charts_config';

const RecentHostGraph = ({ providerId }) => {
  const [data, setCardData] = useState({ loading: true });

  useEffect(() => {
    const url = `/ems_infra_dashboard/recent_hosts_data/${providerId}`;
    http.get(url)
      .then((response) => {
        setCardData({
          loading: false,
          hosts: response.data,
        });
      });
  }, []);

  if (data.loading) return null;
  return (
    <div className="card-pf card-pf-utilization">
      <div className="card-pf-heading">
        <h2 className="card-pf-title">{data.hosts.recentResources.config.title}</h2>
      </div>
      <div className="card-pf-body">
        <HostLineChart data={data.hosts.recentResources} config={chartConfig.recentResourcesConfig} />
      </div>
    </div>
  );
};

RecentHostGraph.propTypes = {
  providerId: PropTypes.string.isRequired,
};

export default RecentHostGraph;
