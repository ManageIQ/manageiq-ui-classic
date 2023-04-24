import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import HeatMapChartGraph from './HeatMapChartGraph';
import { http } from '../../../http_api';

const HeatChart = ({
  providerId, apiUrl, dataPoint1, dataPoint2, dataPointAvailable, title,
}) => {
  const [data, setCardData] = useState({ loading: true });

  useEffect(() => {
    const url = `/${apiUrl}/${providerId}`;
    http.get(url)
      .then((response) => {
        setCardData({
          loading: false,
          vms: response.data.heatmaps,
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
        <HeatMapChartGraph
          data={data.vms}
          dataPoint1={dataPoint1}
          dataPoint2={dataPoint2}
          dataPointAvailable={dataPointAvailable}
          title={title}
        />
      </div>
    </div>
  );
};

HeatChart.propTypes = {
  providerId: PropTypes.string.isRequired,
  apiUrl: PropTypes.string.isRequired,
  dataPoint1: PropTypes.string.isRequired,
  dataPoint2: PropTypes.string,
  dataPointAvailable: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

HeatChart.defaultProps = {
  dataPointAvailable: true,
  dataPoint2: '',
};

export default HeatChart;
