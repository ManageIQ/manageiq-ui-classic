import React, { useState } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './physical-storage-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const PhysicalStorageForm = ({ redirect }) => {
  const state = useState(undefined);

  const onSubmit = async(values) => {
    miqSparkleOn();
    const message = __('Physical storage added');
    API.post('/api/physical_storages', { action: 'create', resource: values })
      .then(() => miqRedirectBack(message, 'success', redirect)).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = __('Adding of physical storage was cancelled by the user');
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

PhysicalStorageForm.propTypes = {
  redirect: PropTypes.string.isRequired,
};

export default PhysicalStorageForm;
