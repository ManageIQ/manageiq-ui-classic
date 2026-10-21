import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading } from '@carbon/react';
import MiqFormRenderer from '@@ddf';
import createSchema from './visual-settings-form.schema';
import { locationReload } from '../../helpers/window-location';

const VisualSettingsForm = ({ recordId, locales = [] }) => {
  const [{
    initialValues, shortcuts, timezoneOptions, isLoading,
  }, setState] = useState({ isLoading: true });

  useEffect(() => {
    API.get('/api/shortcuts?expand=resources&attributes=description,url').then(({ resources }) => {
      const shortcuts = [];

      resources.forEach((shortcut) => {
        shortcuts.push({ value: shortcut.url, label: shortcut.description });
      });

      return shortcuts;
    }).then((shortcuts) => {
      API.get('/api').then(({ timezones }) => {
        const timezoneOptions = [];

        timezones.forEach((timezone) => {
          timezoneOptions.push({ value: timezone.name, label: timezone.description });
        });

        return timezoneOptions;
      }).then((timezoneOptions) => {
        API.get(`/api/users/${recordId}?attributes=settings`).then(({ settings }) => setState({
          initialValues: settings,
          shortcuts,
          timezoneOptions,
          isLoading: false,
        }));
      });
    });
  }, [recordId]);

  const onSubmit = (settings) => {
    settings.perpage.list = parseInt(settings.perpage.list, 10);
    settings.perpage.reports = parseInt(settings.perpage.reports, 10);
    miqSparkleOn();
    API.patch(`/api/users/${recordId}`, { settings }).then(() => {
      locationReload();
      add_flash(__('User Interface settings saved'), 'success');
    }).catch(miqSparkleOff);
  };

  if (isLoading) {
    return (
      <div className="loadSettings">
        <Loading active small withOverlay={false} className="loading" />
      </div>
    );
  }
  return (
    <MiqFormRenderer
      schema={createSchema(shortcuts, timezoneOptions, locales)}
      initialValues={initialValues}
      onSubmit={onSubmit}
      canReset
    />
  );
};

VisualSettingsForm.propTypes = {
  recordId: PropTypes.string.isRequired,
  // Array of [label, value] pairs, as in FastGettext.human_available_locales
  locales: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
};

export default VisualSettingsForm;
