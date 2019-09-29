import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import PfAggregateStatusCard from './pf_aggregate_status_card';

const AggregateStatusCard = ({ providerId, providerType }) => {
  const [data, setCardData] = useState({ loading: true });

  useEffect(() => {
    const url = `/${providerType}_dashboard/aggregate_status_data/${providerId ? providerId : ''}`;
    http.get(url)
    .then(response => {
      console.log(response);
      const aggStatusData = response.data.aggStatus;
      setCardData({
        loading: false,
        status: aggStatusData.status,
        aggStatus: aggStatusData.attrData,
        showTopBorder: aggStatusData.showTopBorder,
        aggregateLayout: aggStatusData.aggregateLayout,
        aggregateClass: aggStatusData.aggregateClass,
      })
    });
  }, []);

  if (data.loading) {
    return <div>loading...</div>;
  }

  return (
    <div className='aggregate_status'>
      <div className='col-xs-12 col-sm-12 col-md-3 col-lg-2 here'>
        <PfAggregateStatusCard
           layout={data.aggregateLayout}
           className={data.aggregateClass}
           data={data.status}
           showTopBorder={data.showTopBorder}
        />
      </div>
      <div className='col-xs-12 col-sm-12 col-md-9 col-lg-10'>
        <div className='row'>
          { data.aggStatus.map( st => (
              <div key={st.id} className='col-xs-12 col-sm-6 col-md-4 col-lg-3'>
                <PfAggregateStatusCard
                  layout='mini'
                  id={st.id}
                  data={st}
                  showTopBorder={true}
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

AggregateStatusCard.propTypes = {
  providerId: PropTypes.string,
  providerType: PropTypes.string.isRequired,
};

export default AggregateStatusCard;
