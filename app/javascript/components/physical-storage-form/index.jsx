import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import createSchema from './physical-storage-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const PhysicalStorageForm = ({ recordId, storageManagerId }) => {
  const [state, setState] = useState({});
  const { isLoading, initialValues } = state;
  const submitLabel = !!recordId ? __('Save') : __('Add');

  const loadSchema = (appendState = {}) => () => {
    setState((state) => ({
      ...state,
      ...appendState,
    }));
  };

  useEffect(() => {
    if (recordId) {
      API.get(`/api/physical_storages/${recordId}`).then((initialValues) => {
        API.options(`/api/physical_storages?ems_id=${initialValues.ems_id}`)
          .then(loadSchema({ initialValues: { ...initialValues, edit: 'yes' }, isLoading: false }));
      });
    }
    if (storageManagerId) {
      API.options(`/api/physical_storages?ems_id=${storageManagerId}`)
        .then(loadSchema({ initialValues: { ems_id: storageManagerId }, isLoading: false }));
    }
  }, [recordId, storageManagerId]);

  const onSubmit = ({ edit: _edit, ...values }) => {
    miqSparkleOn();
    const request = recordId ? API.patch(`/api/physical_storages/${recordId}`, values) : API.post('/api/physical_storages', values);
    request.then(() => {
      const message = sprintf(
        recordId
          ? __('Modification of Physical Storage "%s" has been successfully queued.')
          : __('Add of Physical Storage "%s" has been successfully queued.'),
        values.name,
      );
      miqRedirectBack(message, undefined, '/physical_storage/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Physical Storage "%s" was canceled by the user.')
        : __('Add of new Physical Storage was cancelled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/physical_storage/show_list');
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(!!recordId, !!storageManagerId, initialValues, state, setState)}
      initialValues={initialValues}
      canReset={!!recordId}
      onSubmit={onSubmit}
      onReset={() => add_flash(__('All changes have been reset'), 'warn')}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
    />
  );
};

PhysicalStorageForm.propTypes = {
  recordId: PropTypes.string,
  storageManagerId: PropTypes.string,
};
PhysicalStorageForm.defaultProps = {
  recordId: undefined,
  storageManagerId: undefined,
};

export default PhysicalStorageForm;
