import React, { useState } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './host-initiator-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const HostInitiatorForm = ({ redirect }) => {
  const state = useState(undefined);

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

  return (
    <MiqFormRenderer
      schema={createSchema(...state)}
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
