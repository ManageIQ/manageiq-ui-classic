import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { http } from '../../../http_api';
import EmptyChart from "../emptyChart";
import StackBarChartGraph from "../../carbon-charts/stackBarChart";

const EventChart = ({
                     providerId, apiUrl, dataPoint1, dataPoint2, dataPointAvailable, title,
                   }) => {
  const [data, setCardData] = useState({ loading: true });

  useEffect(() => {
    const url = `/${apiUrl}/${providerId}`;

    http.get(url)
      .then((response) => {
        setCardData({
          loading: false,
          vms: response.data.aggEvents ,
        });
      });
  }, []);
  if (data.loading) return null;

  const chart_options = {
    title,
    axes: {
      left: {
        mapsTo: 'value',
        stacked: true,
      },
      bottom: {
        mapsTo: 'key',
        scaleType: 'labels',
      },
    },
    height: '400px',
    tooltip: {
      truncation: {
        type: 'none',
      },
    },
    color: {
      pairing: {
        option: 2
      },
      scale: {
        fixed: "#1A52F3",
        not_fixed: "#FF0000"
      }
    }
  };

  return (
    <div className="card-pf card-pf-utilization">
      <div className="card-pf-heading">
        <h2 className="card-pf-title">{title}</h2>
      </div>
      <div className="card-pf-body">
        {(data.vms.length > 0) ? <StackBarChartGraph data={data.vms} title={title} chart_options={chart_options} />
        : <EmptyChart />}
      </div>
    </div>
  );
};

EventChart.propTypes = {
  providerId: PropTypes.string.isRequired,
  apiUrl: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default EventChart;
