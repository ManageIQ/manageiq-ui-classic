import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import createSchema from './host-initiator-group-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const HostInitiatorGroupForm = ({ redirect, storageManagerId }) => {
  const [state, setState] = useState({});
  const [storageId, setStorageId] = useState(undefined);
  const { isLoading, initialValues } = state;

  const loadSchema = (appendState = {}) => () => {
    setState((state) => ({
      ...state,
      ...appendState,
    }));
  };

  useEffect(() => {
    if (storageManagerId) {
      API.options(`/api/host_initiator_groups?ems_id=${storageManagerId}`)
        .then(loadSchema({ initialValues: { ems_id: storageManagerId }, isLoading: false }));
    }
  }, [storageManagerId]);

  const onSubmit = async(values) => {
    miqSparkleOn();
    const message = sprintf(
      'Add of Host initiator group "%s" has been successfully queued',
      values.name
    );
    API.post('/api/host_initiator_groups', { action: 'create', resource: values })
      .then(() => miqRedirectBack(message, 'success', redirect)).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = __('Creation of new Host Initiator Group was canceled by the user');
    miqRedirectBack(message, 'warning', '/host_initiator_group/show_list');
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;

  return !isLoading && (
    <MiqFormRenderer
      // validate={validate}
      schema={createSchema(state, setState, !!storageManagerId, initialValues, storageId, setStorageId)}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{
        submitLabel: __('Add'),
        cancelLabel: __('Cancel'),
      }}
    />
  );
};

HostInitiatorGroupForm.propTypes = {
  redirect: PropTypes.string.isRequired,
};

HostInitiatorGroupForm.propTypes = {
  storageManagerId: PropTypes.string,
};
HostInitiatorGroupForm.defaultProps = {
  storageManagerId: undefined,
};

export default HostInitiatorGroupForm;
