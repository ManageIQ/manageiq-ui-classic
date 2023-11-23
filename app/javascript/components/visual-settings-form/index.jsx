import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './visual-settings-form.schema';

const VisualSettingsForm = ({ recordId, changeSettings }) => {
  const [{ initialValues, timezoneOptions, isLoading }, setState] = useState({ isLoading: true });

  useEffect(() => {
    API.get('/api').then(({ timezones }) => {
      const timezoneOptions = [];
      timezones.forEach((timezone) => {
        timezoneOptions.push({ value: timezone.name, label: timezone.description });
      });
      return timezoneOptions;
    }).then((timezoneOptions) => {
      API.get(`/api/users/${recordId}?attributes=settings`).then(({ settings }) => setState({
        initialValues: settings,
        timezoneOptions,
        isLoading: false,
      }));
    });
  }, [recordId]);

  const onSubmit = (settings) => {
    if (changeSettings) {
      settings.perpage.list = parseInt(settings.perpage.list, 10);
      settings.perpage.reports = parseInt(settings.perpage.reports, 10);
      miqSparkleOn();
      API.patch(`/api/users/${recordId}`, { settings }).then(() => {
        window.location.reload();
        add_flash(__('User Interface settings saved'), 'success');
      }).catch(miqSparkleOff);
    } else {
      add_flash(__('The user is not authorized for this task or item.'), 'error');
    }
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(timezoneOptions)}
      initialValues={initialValues}
      onSubmit={onSubmit}
      canReset
    />
  );
};

VisualSettingsForm.propTypes = {
  recordId: PropTypes.string.isRequired,
  changeSettings: PropTypes.bool.isRequired,
};

export default VisualSettingsForm;
