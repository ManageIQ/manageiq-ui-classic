import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import RefreshNotifications from './refresh-notifications';
import { http } from '../http_api';

const RefreshDataNotification = ({
  providerId, apiUrl,
}) => {
  const [data, setCardData] = useState({ loading: true });

  useEffect(() => {
    const url = `/${apiUrl}/${providerId}`;
    http.get(url)
      .then((response) => {
        setCardData({
          loading: false,
          status: response.data,
        });
      });
  }, []);

  if (data.loading || data.status.default_cred === 'Valid') return null;
  return (
    <RefreshNotifications status={data.status} />
  );
};
RefreshDataNotification.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  providerId: PropTypes.string.isRequired,
};

export default RefreshDataNotification;
