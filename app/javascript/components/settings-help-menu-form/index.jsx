import { useState, useEffect } from 'react';
import { InlineNotification } from '@carbon/react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import { API } from '../../http_api';
import createSchema from './help-menu-form.schema';

const OPEN_IN_OPTIONS = [
  { label: __('Current Window'), value: 'default' },
  { label: __('New Window'), value: 'new_window' },
  { label: __('About Modal'), value: 'modal' },
];

const HelpMenuTab = ({ regionId }) => {
  const [{
    initialValues, defaults, isLoading, notification, formKey,
  }, setState] = useState({ isLoading: true, formKey: 0 });

  useEffect(() => {
    Promise.all([
      API.get(`/api/regions/${regionId}/settings`),
      API.get('/api/settings/docs'),
    ]).then(([{ help_menu: helpMenu }, { docs }]) => {
      setState({
        isLoading: false,
        initialValues: helpMenu || {},
        defaults: docs || {},
        formKey: 0,
      });
    });
  }, [regionId]);

  const onSubmit = (values) => {
    // Return value if non-blank, otherwise fall back to the placeholder default.
    const withDefault = (v, fallback) => (v && v.trim() !== '' ? v : (fallback || null));
    // Blank type (dropdown never touched) falls back to 'default'.
    const typeOrDefault = (v) => v || 'default';

    const helpMenu = {
      documentation: {
        title: withDefault(values.documentation_title, __('Documentation')),
        url: withDefault(values.documentation_url, defaults.product_documentation_website),
        type: typeOrDefault(values.documentation_type),
      },
      product: {
        title: withDefault(values.product_title, defaults.product_support_website_text),
        url: withDefault(values.product_url, defaults.product_support_website),
        type: typeOrDefault(values.product_type),
      },
      about: {
        title: withDefault(values.about_title, __('About')),
        // When "About Modal" is selected the URL is irrelevant — send null.
        url: typeOrDefault(values.about_type) === 'modal' ? '' : values.about_url,
        type: typeOrDefault(values.about_type),
      },
    };

    API.patch(`/api/regions/${regionId}/settings`, { help_menu: helpMenu }, { skipErrors: true })
      .then(() => {
        setState((prev) => ({
          ...prev,
          initialValues: helpMenu,
          formKey: prev.formKey + 1,
          notification: { kind: 'success', message: __('Help menu customization changes successfully stored.') },
        }));
      })
      .catch(() => {
        setState((prev) => ({
          ...prev,
          notification: { kind: 'error', message: __('Storing the custom help menu configuration was not successful.') },
        }));
      });
  };

  return !isLoading && (
    <div className="settings-help-menu-tab">
      <h4 className="settings-help-menu-tab__header">{__('Customize Help Menu')}</h4>
      <InlineNotification
        kind="info"
        title={__('Any change to the help menu will take effect upon a full page reload.')}
        lowContrast
        hideCloseButton
      />
      {notification && (
        <InlineNotification
          kind={notification.kind}
          title={notification.message}
          lowContrast
          onCloseButtonClick={() => setState((prev) => ({ ...prev, notification: undefined }))}
        />
      )}
      <div className="settings-help-menu-tab__form">
        <MiqFormRenderer
          key={formKey}
          schema={createSchema(OPEN_IN_OPTIONS, initialValues, defaults)}
          initialValues={{
            documentation_title: initialValues.documentation && initialValues.documentation.title,
            documentation_url: initialValues.documentation && initialValues.documentation.url,
            documentation_type: initialValues.documentation && initialValues.documentation.type,
            product_title: initialValues.product && initialValues.product.title,
            product_url: initialValues.product && initialValues.product.url,
            product_type: initialValues.product && initialValues.product.type,
            about_title: initialValues.about && initialValues.about.title,
            about_url: initialValues.about && initialValues.about.url,
            about_type: initialValues.about && initialValues.about.type,
          }}
          validate={(values) => {
            if (values.about_type !== 'modal' && (!values.about_url || values.about_url.trim() === '')) {
              return { about_url: __('Required') };
            }
            return {};
          }}
          onSubmit={onSubmit}
          disableSubmit={['pristine', 'invalid']}
          buttonsLabels={{ submitLabel: __('Save') }}
        />
      </div>
    </div>
  );
};

HelpMenuTab.propTypes = {
  regionId: PropTypes.number.isRequired,
};

export default HelpMenuTab;
