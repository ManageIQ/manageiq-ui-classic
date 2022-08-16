import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import createSchema from './host-initiator-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const HostInitiatorForm = ({ redirect, storageManagerId }) => {
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
      API.options(`/api/host_initiators?ems_id=${storageManagerId}`)
        .then(loadSchema({ initialValues: { ems_id: storageManagerId }, isLoading: false }));
    }
  }, [storageManagerId]);

  const onSubmit = async(values) => {
    miqSparkleOn();
    const message = sprintf(__('Defining of Host initiator "%s" has been successfully queued.'), values.name);
    API.post('/api/host_initiators', { action: 'create', resource: values })
      .then(() => miqRedirectBack(message, 'success', redirect)).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = __('defining of host initiator was cancelled by the user');
    miqRedirectBack(message, 'success', redirect);
  };

  const validate = (values) => {
    const errors = {};
    if ((!values.wwpn || !values.wwpn.length) && (!values.custom_wwpn || !values.custom_wwpn.length) && (values.port_type === 'FC' || values.port_type === 'NVMeFC')) {
      errors.wwpn = 'Please provide at least one WWPN.';
    }
    return errors;
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;

  return !isLoading && (
    <MiqFormRenderer
      validate={validate}
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

HostInitiatorForm.propTypes = {
  redirect: PropTypes.string.isRequired,
};

HostInitiatorForm.propTypes = {
  storageManagerId: PropTypes.string,
};
HostInitiatorForm.defaultProps = {
  storageManagerId: undefined,
};

export default HostInitiatorForm;
