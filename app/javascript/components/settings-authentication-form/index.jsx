import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import createSchema from './settings-authentication-form-schema';
import MiqFormRenderer from '../../forms/data-driven-form';
import { API } from '../../http_api';

const SettingsAuthenticationForm = ({ id, sessionData }) => {
  const [data, setData] = useState({
    isLoading: true,
    initialValue: sessionData,
  });

  useEffect(() => {
    miqSparkleOn();
    API.get(`/api/servers/${id}/settings`)
      .then(({ authentication }) => {
        setData({
          ...data,
          initialValue: { ...data.initialValue, ...authentication },
          isLoading: false,
        });
        miqSparkleOff();
      });
  }, [id]);

  if (data.isLoading) {
    return null;
  }

  const onSubmit = (value) => {
    console.log('onSubmit', value);
    if (value.mode === 'amazon') {
      console.log('verify');
      http.post('/ops/settings_update/authentication?button=amazon_verify', { value })
        .then((data) => console.log(data));
    }
  };

  console.log('data=', data);

  return (
    <MiqFormRenderer
      initialValues={data.initialValue}
      schema={createSchema()}
      canReset={!!id}
      onSubmit={onSubmit}
      buttonsLabels={{
        submitLabel: __('Save'),
      }}
      className=""
    />
  );
};

SettingsAuthenticationForm.propTypes = {
  id: PropTypes.number.isRequired,
  sessionData: PropTypes.shape({
    session_timeout_hours: PropTypes.number,
    session_timeout_mins: PropTypes.number,
  }).isRequired,
};

export default SettingsAuthenticationForm;
