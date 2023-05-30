import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import createSchema from './host-initiator-group-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import EditingContext from './editing-context';

const HostInitiatorGroupForm = ({ recordId, storageManagerId }) => {
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
      API.get(`/api/host_initiator_groups/${recordId}`).then((initialValues) => {
        API.options(`/api/host_initiator_groups?ems_id=${initialValues.ems_id}`)
          .then(loadSchema({ initialValues: { ...initialValues, edit: 'yes' }, isLoading: false }));
      });
    }
    if (storageManagerId) {
      API.options(`/api/host_initiator_groups?ems_id=${storageManagerId}`)
        .then(loadSchema({ initialValues: { ems_id: storageManagerId }, isLoading: false }));
    }
  }, [recordId, storageManagerId]);

  const onSubmit = ({ edit: _edit, ...values }) => {
    miqSparkleOn();
    const request = recordId ? API.patch(`/api/host_initiator_groups/${recordId}`, values) : API.post('/api/host_initiator_groups', values);
    request.then(() => {
      const message = sprintf(
        recordId
          ? __('Modification of Host Initiator Group "%s" has been successfully queued.')
          : __('Add of Host Initiator Group has been successfully queued.'),
        values.name,
      );
      miqRedirectBack(message, undefined, '/host_initiator_group/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Host Initiator Group "%s" was canceled by the user.')
        : __('Creation of new Host Initiator Group was canceled by the user'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/host_initiator_group/show_list');
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;

  return (
    <div>
      { !isLoading && (
        <EditingContext.Provider value={{ storageManagerId, setState }}>
          <MiqFormRenderer
            // // validate={validate}
            schema={createSchema(!!recordId, !!storageManagerId, initialValues, state, setState)}
            // state, setState, !!storageManagerId, initialValues, storageId, setStorageId
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

HostInitiatorGroupForm.propTypes = {
  recordId: PropTypes.string,
  storageManagerId: PropTypes.string,
};
HostInitiatorGroupForm.defaultProps = {
  recordId: undefined,
  storageManagerId: undefined,
};

export default HostInitiatorGroupForm;
