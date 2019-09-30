import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Quadicon } from '@manageiq/react-ui-components/dist/quadicon';

import PfAggregateStatusCard from './pf_aggregate_status_card';

const AggregateStatusCard = ({ providerId, providerType }) => {
  const [data, setCardData] = useState({ loading: true });

  useEffect(() => {
    const url = `/${providerType}_dashboard/aggregate_status_data/${providerId || ''}`;
    http.get(url)
      .then((response) => {
        const aggStatusData = response.data.aggStatus;
        setCardData({
          loading: false,
          status: aggStatusData.status,
          quadicon: aggStatusData.quadicon,
          aggStatus: aggStatusData.attrData,
          showTopBorder: aggStatusData.showTopBorder,
          aggregateLayout: aggStatusData.aggregateLayout,
          aggregateClass: aggStatusData.aggregateClass,
        });
      });
  }, []);

  if (data.loading) {
    return <div>loading...</div>;
  }

  const renderPlain = () => (
    <PfAggregateStatusCard
      layout={data.aggregateLayout}
      className={data.aggregateClass}
      data={data.status}
      showTopBorder={data.showTopBorder}
    />
  );

  const renderQuad = () => (
    <div className="card-pf card-pf-aggregate-status">
      <h2 className="card-pf-body">
        <Quadicon data={data.quadicon} />
      </h2>
    </div>
  );

  return (
    <div className="aggregate_status">
      <div className="col-xs-12 col-sm-12 col-md-3 col-lg-2 here">
        { data.quadicon ? renderQuad() : renderPlain() }
      </div>
      <div className="col-xs-12 col-sm-12 col-md-9 col-lg-10">
        <div className="row">
          { data.aggStatus.map(st => (
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
};

AggregateStatusCard.propTypes = {
  providerId: PropTypes.string,
  providerType: PropTypes.string.isRequired,
};

AggregateStatusCard.defaultProps = {
  providerId: null,
};

export default AggregateStatusCard;
