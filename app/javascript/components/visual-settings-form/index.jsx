import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './visual-settings-form.schema';

const VisualSettingsForm = ({ recordId }) => {
  const [{ initialValues, isLoading }, setState] = useState({ isLoading: true });

  useEffect(() => {
    API.get(`/api/users/${recordId}?attributes=settings`).then(({ settings }) => setState({
      initialValues: settings,
      isLoading: false,
    }));
  }, [recordId]);

  const onSubmit = (settings) => {
    miqSparkleOn();
    API.patch(`/api/users/${recordId}`, { settings }).then(() => {
      add_flash(__('User Interface settings saved'), 'success');
      miqSparkleOff();
    }).catch(miqSparkleOff);
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema()}
      initialValues={initialValues}
      onSubmit={onSubmit}
      canReset
    />
  );
};

VisualSettingsForm.propTypes = {
  recordId: PropTypes.string.isRequired,
};

export default VisualSettingsForm;
