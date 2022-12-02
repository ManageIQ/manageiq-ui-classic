import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import createSchema from './settings-authentication-form-schema';
import MiqFormRenderer from '../../forms/data-driven-form';
import { API } from '../../http_api';
import mapper from '../../forms/mappers/componentMapper';
import SettingsAuthenticationProviderValidator from '../settings-authentication-provider-validator';

const SettingsAuthenticationForm = ({ id, sessionData }) => {
  console.log('sessionData=', sessionData);
  const [data, setData] = useState({
    isLoading: true,
    initialValue: sessionData,
    validate: false,
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

  const onModeChange = (value) => {
    const status = value !== 'amazon';
    setData({ ...data, validation: status });
  };

  const onFieldChange = ({ name, value }) => {
    console.log('onFieldChange----------------------', name, value);
    data.initialValue[name] = value;
    console.log('data=', data.initialValue);
    setData({
      ...data,
      initialValue: { ...data.initialValue },
    });
  };

  const componentMapper = {
    ...mapper,
    'settings-authentication-provider-validator': SettingsAuthenticationProviderValidator,
  };

  return (
    <MiqFormRenderer
      componentMapper={componentMapper}
      initialValues={data.initialValue}
      schema={createSchema(onModeChange, data.initialValue, onFieldChange)}
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
