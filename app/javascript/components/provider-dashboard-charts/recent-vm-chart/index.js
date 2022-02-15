import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import VmAreaChart from './vmAreaChart';
import { http } from '../../../http_api';
import { chartConfig } from '../charts_config';

const RecentVmGraph = ({
  providerId, title, config, apiUrl, dataPoint,
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
  return (
    <div className="card-pf card-pf-utilization">
      <div className="card-pf-heading">
        <h2 className="card-pf-title">{title}</h2>
      </div>
      <div className="card-pf-body">
        <VmAreaChart data={data.vms} config={chartConfig[config]} dataPoint={dataPoint} title={title} />
      </div>
    </div>
  );
};

RecentVmGraph.propTypes = {
  providerId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  config: PropTypes.string.isRequired,
  apiUrl: PropTypes.string.isRequired,
  dataPoint: PropTypes.string.isRequired,
};

export default RecentVmGraph;
