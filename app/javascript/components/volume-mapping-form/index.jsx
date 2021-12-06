import React, { useState } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './volume-mapping-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const VolumeMappingForm = ({ redirect }) => {
  const [emsId, setEmsId] = useState(undefined);
  const [storageId, setStorageId] = useState(undefined);
  const [volumeId, setVolumeId] = useState(undefined);
  const [hostInitiatorId, setHostInitiatorId] = useState(undefined);
  const [hostInitiatorGroupId, setHostInitiatorGroupId] =  useState(undefined);

  const onSubmit = async(values) => {
    miqSparkleOn();
    const message = __('Volume mapping define');
    API.post('/api/volume_mappings', { action: 'create', resource: values })
      .then(() => miqRedirectBack(message, 'success', redirect)).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = __('defining of volume mapping was cancelled by the user');
    miqRedirectBack(message, 'success', redirect);
  };

  return (
    <MiqFormRenderer
      schema={createSchema(emsId, setEmsId, storageId, setStorageId, volumeId, setVolumeId, hostInitiatorId, setHostInitiatorId, hostInitiatorGroupId, setHostInitiatorGroupId)}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{
        submitLabel: __('Add'),
        cancelLabel: __('Cancel'),
      }}
    />
  );
};

VolumeMappingForm.propTypes = {
  redirect: PropTypes.string.isRequired,
};

export default VolumeMappingForm;
