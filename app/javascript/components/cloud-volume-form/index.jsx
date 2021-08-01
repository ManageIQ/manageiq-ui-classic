import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './cloud-volume-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

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

  const onSubmit = ({ edit: _edit, ...values }) => {
    miqSparkleOn();

    const request = recordId ? API.patch(`/api/cloud_volumes/${recordId}`, values) : API.post('/api/cloud_volumes', values);
    request.then(() => {
      const message = sprintf(
        recordId
          ? __('Modification of Cloud Volume "%s" has been successfully queued.')
          : __('Add of Cloud Volume "%s" has been successfully queued.'),
        values.name,
      );
      miqRedirectBack(message, undefined, '/cloud_volume/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Cloud Volume "%s" was canceled by the user.')
        : __('Add of new Cloud Volume was cancelled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/cloud_volume/show_list');
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(fields, !!recordId, !!storageManagerId, loadSchema)}
      initialValues={initialValues}
      canReset={!!recordId}
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
