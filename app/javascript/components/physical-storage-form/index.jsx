import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import createSchema from './physical-storage-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import mapper from '../../forms/mappers/componentMapper';
import EditingContext from './editing-context';
import ValidateStorageCredentials from './validate-storage-credentials';
import { getCapabilityUuid, getProviderCapabilities } from '../../helpers/storage_manager/filter-by-capabilities-utils';

const PhysicalStorageForm = ({ recordId, storageManagerId }) => {
  const [state, setState] = useState({});
  const { isLoading, initialValues } = state;
  const [familyId, setFamilyId] = useState(undefined);
  const submitLabel = !!recordId ? __('Save') : __('Add');

  const loadSchema = (appendState = {}) => () => {
    setState((state) => ({
      ...state,
      ...appendState,
    }));
  };

  const defaultCapabilities = async(familyId, emsId) => {
    const valueArray = [];
    const providerCapabilities = await getProviderCapabilities(emsId);

    const response = await API.get(
      `/api/physical_storage_families/${familyId}?attributes=capabilities`
    );

    const { capabilities } = response;

    Object.keys(capabilities).forEach((capabilityName) => {
      capabilities[capabilityName].forEach((capabilityValue) => {
        valueArray.push(getCapabilityUuid(providerCapabilities, capabilityName, capabilityValue));
      });
    });

    return valueArray;
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

  const redirectUrl = storageManagerId ? `/ems_storage/${storageManagerId}?display=physical_storages#/` : '/physical_storage/show_list';
  const request = (values) => (recordId ? API.patch(`/api/physical_storages/${recordId}`, values) : API.post('/api/physical_storages', values));
  const sendMessage = (name) => {
    const message = sprintf(
      recordId
        ? __('Modification of Physical Storage "%s" has been successfully queued.')
        : __('Add of Physical Storage has been successfully queued.'),
      name,
    );
    miqRedirectBack(message, undefined, redirectUrl);
  };

  const onSubmit = ({ edit: _edit, ...values }) => {
    miqSparkleOn();

    if (values.capabilities === 'Default') {
      defaultCapabilities(values.physical_storage_family_id, values.ems_id).then(
        (uuid) => values.enabled_capability_values = uuid
      ).then(() => request(values).then(() => sendMessage(values.name)))
        .catch(miqSparkleOff);
    } else {
      request(values).then(() => sendMessage(values.name))
        .catch(miqSparkleOff);
    }
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Physical Storage "%s" was canceled by the user.')
        : __('Add of new Physical Storage was cancelled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', redirectUrl);
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;

  const componentMapper = {
    ...mapper,
    'validation-button': ValidateStorageCredentials,
  };

  return (
    <div>
      { !isLoading && (
        <EditingContext.Provider value={{ storageManagerId, setState }}>
          <MiqFormRenderer
            componentMapper={componentMapper}
            schema={createSchema(!!recordId, !!storageManagerId, initialValues, state, setState, familyId, setFamilyId)}
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

PhysicalStorageForm.propTypes = {
  recordId: PropTypes.string,
  storageManagerId: PropTypes.string,
};
PhysicalStorageForm.defaultProps = {
  recordId: undefined,
  storageManagerId: undefined,
};

export default PhysicalStorageForm;
