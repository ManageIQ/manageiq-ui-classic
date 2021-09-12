import React, { useState } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './host-initiator-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const HostInitiatorForm = ({ redirect }) => {
  // const state = useState(undefined);
  const [emsId, setEmsId] = useState(undefined);
  const [storageId, setStorageId] = useState(undefined);

  const onSubmit = async(values) => {
    miqSparkleOn();
    const message = __('Host initiator define');
    API.post('/api/host_initiators', { action: 'create', resource: values })
      .then(() => miqRedirectBack(message, 'success', redirect)).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = __('defining of host initiator was cancelled by the user');
    miqRedirectBack(message, 'success', redirect);
  };

  const validate=(values) => {
    const errors = {};
    if ((!values.wwpn || !values.wwpn.length) && (!values.custom_wwpn || !values.custom_wwpn.length)){
      errors.wwpn = "Please provide at least one WWPN."
    }
    return errors;
  }

  return (
    <MiqFormRenderer
      validate={validate}
      schema={createSchema(emsId, setEmsId, storageId, setStorageId)}
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

export default HostInitiatorForm;
