import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import createSchema from './storage-service-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import EditingContext from '../physical-storage-form/editing-context';

const StorageServiceForm = ({ recordId, storageManagerId }) => {
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
      API.get(`/api/storage_services/${recordId}`).then((initialValues) => {
        API.options(`/api/storage_services?ems_id=${initialValues.ems_id}`)
          .then(loadSchema({ initialValues: { ...initialValues, edit: 'yes' }, isLoading: false }));
      });
    }
    if (storageManagerId) {
      API.options(`/api/storage_services?ems_id=${storageManagerId}`)
        .then(loadSchema({ initialValues: { ems_id: storageManagerId }, isLoading: false }));
    }
  }, [recordId, storageManagerId]);

  const onSubmit = ({ edit: _edit, ...values }) => {
    miqSparkleOn();
    const request = recordId ? API.patch(`/api/storage_services/${recordId}`, values) : API.post('/api/storage_services', values);
    request.then(() => {
      const message = sprintf(
        recordId
          ? __('Modification of Storage Service "%s" has been successfully queued.')
          : __('Add of Storage Service "%s" has been successfully queued.'),
        values.name,
      );
      miqRedirectBack(message, undefined, '/storage_service/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Storage Service "%s" was canceled by the user.')
        : __('Add of new Storage Service was cancelled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/storage_services/show_list');
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;

  return (
    <div>
      { !isLoading && (
        <EditingContext.Provider value={{ storageManagerId, setState }}>
          <MiqFormRenderer
            schema={createSchema(!!recordId, !!storageManagerId, initialValues, state, setState)}
            initialValues={initialValues}
            canReset={!!recordId}
            onSubmit={onSubmit}
            onReset={() => add_flash(__('All changes have been reset'), 'warn')}
            onCancel={onCancel}
            buttonsLabels={{ submitLabel }}
          />
        </EditingContext.Provider>
      ) }
    </div>
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
