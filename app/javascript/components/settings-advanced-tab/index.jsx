import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { InlineNotification, Loading } from '@carbon/react';
import MiqFormRenderer from '@@ddf';
import { http } from '../../http_api';
import createSchema from './schema';

const SettingsAdvancedTab = ({
  resourceType, resourceId, warningText, infoText,
}) => {
  const [{
    initialValues, isLoading, isSubmitting, error,
  }, setState] = useState({
    isLoading: true,
    isSubmitting: false,
    initialValues: undefined,
    error: undefined,
  });

  const loadData = () => http
    .get(`/ops/settings_advanced_tab_data?resource_type=${resourceType}&resource_id=${resourceId}`)
    .then(({ file_data: fileData }) => ({ fileData }));

  useEffect(() => {
    loadData()
      .then(({ fileData }) => setState((s) => ({
        ...s, isLoading: false, initialValues: { fileData }, error: undefined,
      })))
      .catch(() => setState((s) => ({ ...s, isLoading: false, error: __('Failed to load configuration data.') })));
  }, [resourceType, resourceId]);

  const onSubmit = ({ fileData }) => {
    setState((s) => ({ ...s, isSubmitting: true }));
    http
      .post('/ops/settings_advanced_save', { resource_type: resourceType, resource_id: resourceId, file_data: fileData }, { skipErrors: [422] })
      .then(({ message }) => {
        add_flash(message, 'success');
        // Re-fetch so the editor reflects the persisted YAML after save
        loadData()
          .then(({ fileData: updated }) => setState((s) => ({
            ...s, isSubmitting: false, initialValues: { fileData: updated }, error: undefined,
          })))
          .catch(() => setState((s) => ({ ...s, isSubmitting: false })));
      })
      .catch(({ data } = {}) => {
        const msg = data && data.message ? data.message : __('Error saving configuration.');
        setState((s) => ({ ...s, isSubmitting: false, error: msg }));
      });
  };

  const onReset = () => {
    loadData()
      .then(({ fileData }) => setState((s) => ({ ...s, initialValues: { fileData }, error: undefined })))
      .catch(() => undefined);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="settings-advanced-tab">
      {isSubmitting && <Loading />}
      {warningText && (
        <InlineNotification
          kind="warning"
          title={warningText}
          lowContrast
          hideCloseButton
        />
      )}
      {infoText && (
        <InlineNotification
          kind="info"
          title={infoText}
          lowContrast
          hideCloseButton
        />
      )}
      {error && (
        <InlineNotification
          kind="error"
          title={error}
          lowContrast
          hideCloseButton
        />
      )}
      {initialValues && (
        <MiqFormRenderer
          key={JSON.stringify(initialValues)}
          schema={createSchema()}
          initialValues={initialValues}
          canReset
          onSubmit={onSubmit}
          onReset={onReset}
          buttonsLabels={{ submitLabel: __('Save') }}
          disableSubmit={isSubmitting ? ['submitting'] : ['pristine', 'invalid']}
          showFormControls
        />
      )}
    </div>
  );
};

SettingsAdvancedTab.propTypes = {
  resourceType: PropTypes.string.isRequired,
  resourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  warningText: PropTypes.string,
  infoText: PropTypes.string,
};

export default SettingsAdvancedTab;
