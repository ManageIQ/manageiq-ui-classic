import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import createSchema from './settings-server.schema';
import { initialFormData } from './helper';

const SettingsServer = ({ selected, formData }) => {
  console.log('Selected=', formData.server);
  console.log('formData=', formData);
  const [{ initialValues, isLoading }, setState] = useState({
    isLoading: true,
    initialValues: { basic: {} },
  });

  console.log(selected);
  useEffect(() => {
    API.get(`/api/servers/${formData.server.id}/settings`).then((result) => {
      const data = initialFormData(result, formData);
      initialValues.basic = data.basic;
      initialValues.serverControls = data.serverControls;
      initialValues.smtp = data.smtp;
      initialValues.webservices = data.webservices;
      initialValues.logging = data.logging;
      console.log(initialValues);
      setState({ initialValues, isLoading: false });
    });
  }, []);
  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(initialValues, formData)}
      initialValues={initialValues}
    />
  );
};

SettingsServer.propTypes = {
  selected: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    zone_id: PropTypes.number.isRequired,
  }).isRequired,
  formData: PropTypes.shape(PropTypes.any).isRequired,
};

export default SettingsServer;
