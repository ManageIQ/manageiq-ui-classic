import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import PfAggregateStatusCard from '../pf_aggregate_status_card';
import { getProviderInfo, getAlertInfo, getAggStatusInfo } from './helper';

const ContainerDashboardCards = ({ providerId }) => {
  const [data, setCardData] = useState({ loading: true });

  useEffect(() => {
    const url = `/container_dashboard/data/${providerId || ''}`;
    http.get(url)
      .then((response) => {
        const aggStatusData = response.data;
        setCardData({
          loading: false,
          status: aggStatusData.status,
          providers: aggStatusData.providers,
          alerts: aggStatusData.alerts,
        });
      });
  }, []);

  if (data.loading === false) {
    const providerStatus = getProviderInfo(data);
    const alertStatus = getAlertInfo(data);
    const AggStatus = getAggStatusInfo(data, providerId);

    return !data.loading && (
      <div>
        <div className="col-xs-12 col-sm-12 col-md-2 ">
          <PfAggregateStatusCard
            layout="tall"
            data={providerStatus}
            showTopBorder
          />
        </div>
        <div className="col-xs-12 col-sm-12 col-md-2 e">
          <PfAggregateStatusCard
            layout="tall"
            data={alertStatus}
            showTopBorder
          />
        </div>
        <div className="col-xs-12 col-sm-12 col-md-8">
          <div className="row">
            {AggStatus.map((st) => (
              <div key={st.id} className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                <PfAggregateStatusCard
                  layout="mini"
                  id={st.id}
                  data={st}
                  showTopBorder
                />
              </div>
            ))}
          </div>
        </div>
      </div>

    );
  }

  return (
    <div className="loadingSpinner">
      <Loading active small withOverlay={false} className="loading" />
    </div>
  );
};

ContainerDashboardCards.propTypes = {
  providerId: PropTypes.string.isRequired,
};

export default ContainerDashboardCards;
