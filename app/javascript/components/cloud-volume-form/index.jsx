import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './cloud-volume-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import mapper from '../../forms/mappers/componentMapper';
import enhancedSelect from '../../helpers/enhanced-select';

const CloudVolumeForm = ({ recordId, storageManagerId }) => {
  const [{ fields, initialValues, isLoading }, setState] = useState({ fields: [], isLoading: !!recordId || !!storageManagerId });
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
      API.get(`/api/cloud_volumes/${recordId}`).then((initialValues) => {
        API.options(`/api/cloud_volumes/${recordId}?ems_id=${initialValues.ems_id}`).then(loadSchema({ initialValues, isLoading: false }));
      });
    }
    if (storageManagerId) {
      API.options(`/api/cloud_volumes?ems_id=${storageManagerId}`)
        .then(loadSchema({ initialValues: { ems_id: storageManagerId }, isLoading: false }));
    }
  }, [recordId, storageManagerId]);

  const redirectUrl = storageManagerId ? `/ems_storage/${storageManagerId}?display=cloud_volumes#/` : '/cloud_volume/show_list';

  const onSubmit = ({ edit: _edit, ...values }) => {
    if (values.ems_id !== '-1') {
      miqSparkleOn();

      const request = recordId ? API.patch(`/api/cloud_volumes/${recordId}`, values) : API.post('/api/cloud_volumes', values);
      request.then(() => {
        const message = sprintf(
          recordId
            ? __('Modification of Cloud Volume "%s" has been successfully queued.')
            : __('Add of Cloud Volume "%s" has been successfully queued.'),
          values.name,
        );
        miqRedirectBack(message, undefined, redirectUrl);
      }).catch(miqSparkleOff);
    }
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Cloud Volume "%s" was canceled by the user.')
        : __('Add of new Cloud Volume was cancelled by the user.'),
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
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(fields, !!recordId, !!storageManagerId, loadSchema, emptySchema, storageManagerId)}
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

CloudVolumeForm.propTypes = {
  recordId: PropTypes.string,
  storageManagerId: PropTypes.string,
};
CloudVolumeForm.defaultProps = {
  recordId: undefined,
  storageManagerId: undefined,
};

export default CloudVolumeForm;
