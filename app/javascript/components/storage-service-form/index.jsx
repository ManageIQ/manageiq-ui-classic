import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import createSchema from './storage-service-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import mapper from '../../forms/mappers/componentMapper';
import enhancedSelect from '../../helpers/enhanced-select';
import GetCompliantResources from './get-compliant-resources';

const StorageServiceForm = ({ recordId, storageManagerId }) => {
  const [{ fields, initialValues, isLoading }, setState] = useState({
    fields: [], isLoading: !!recordId || !!storageManagerId,
  });
  const submitLabel = !!recordId ? __('Save') : __('Add');

  const loadSchema = (appendState = {}) => ({ data: { form_schema: { fields } } }) => {
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
    }));
  };

  const emptySchema = (appendState = {}) => {
    const fields = [];
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
    }));
  };

  useEffect(() => {
    if (recordId) {
      API.get(`/api/storage_services/${recordId}?attributes=storage_resources`)
        .then((initialValues) => {
          initialValues.storage_resource_id = [];
          initialValues.storage_resources.forEach((resource) =>
            initialValues.storage_resource_id.push({ label: resource.name, value: resource.id }));

          API.options(`/api/storage_services/${recordId}?ems_id=${initialValues.ems_id}`)
            .then(loadSchema({ initialValues, isLoading: false }));
        });
    }
    if (storageManagerId) {
      API.options(`/api/storage_services?ems_id=${storageManagerId}`)
        .then(loadSchema({ initialValues: { ems_id: storageManagerId }, isLoading: false }));
    }
  }, [recordId, storageManagerId]);

  const redirectUrl = storageManagerId ? `/ems_storage/${storageManagerId}?display=storage_services#/` : '/storage_service/show_list';

  const onSubmit = ({ edit: _edit, ...values }) => {
    if (values.ems_id !== '-1') {
      miqSparkleOn();

      const request = recordId ? API.patch(`/api/storage_services/${recordId}`, values) : API.post('/api/storage_services', values);
      request.then(() => {
        const message = sprintf(
          recordId
            ? __('Modification of Storage Service "%s" has been successfully queued.')
            : __('Add of Storage Service "%s" has been successfully queued.'),
          values.name,
        );

        miqRedirectBack(message, undefined, redirectUrl);
      }).catch(miqSparkleOff);
    }
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Storage Service "%s" was canceled by the user.')
        : __('Add of new Storage Service was cancelled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', redirectUrl);
  };

  const validation = (values) => {
    const errors = {};
    if (values.ems_id === '-1') {
      errors.ems_id = __('Required');
    }
    return errors;
  };

  const componentMapper = {
    ...mapper,
    'enhanced-select': enhancedSelect,
    'compliance-button': GetCompliantResources,
  };

  const schema = createSchema(fields, !!recordId, !!storageManagerId, loadSchema, emptySchema);
  const requiredCapabilities = schema.fields.find((field) => field.name === 'required_capabilities');
  if (requiredCapabilities) {
    delete requiredCapabilities.resolveProps;
  }

  return !isLoading && (
    <MiqFormRenderer
      schema={schema}
      componentMapper={componentMapper}
      initialValues={initialValues}
      canReset={!!recordId}
      validate={validation}
      onSubmit={onSubmit}
      onReset={() => add_flash(__('All changes have been reset'), 'warn')}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
    />
  );
};

StorageServiceForm.propTypes = {
  recordId: PropTypes.string,
  storageManagerId: PropTypes.string,
};
StorageServiceForm.defaultProps = {
  recordId: undefined,
  storageManagerId: undefined,
};

export default StorageServiceForm;
