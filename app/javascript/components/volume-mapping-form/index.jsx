import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';

import MiqFormRenderer from '@@ddf';
import createSchema from './volume-mapping-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const VolumeMappingForm = ({ redirect, storageManagerId }) => {
  const [state, setState] = useState({});
  const [storageId, setStorageId] = useState(undefined);
  const { isLoading, initialValues } = state;
  const [volumeId, setVolumeId] = useState(undefined);
  const [hostInitiatorId, setHostInitiatorId] = useState(undefined);
  const [hostInitiatorGroupId, setHostInitiatorGroupId] =  useState(undefined);

  const loadSchema = (appendState = {}) => () => {
    setState((state) => ({
      ...state,
      ...appendState,
    }));
  };

  useEffect(() => {
    if (storageManagerId) {
      API.options(`/api/volume_mappings?ems_id=${storageManagerId}`)
        .then(loadSchema({ initialValues: { ems_id: storageManagerId }, isLoading: false }));
    }
  }, [storageManagerId]);

  const onSubmit = async(values) => {
    miqSparkleOn();
    const message = __('Defining of a new Volume mapping has been successfully queued.');
    API.post('/api/volume_mappings', { action: 'create', resource: values })
      .then(() => miqRedirectBack(message, 'success', redirect)).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = __('defining of volume mapping was cancelled by the user');
    miqRedirectBack(message, 'success', redirect);
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(state, setState, !!storageManagerId, initialValues, storageId, setStorageId, volumeId, setVolumeId, hostInitiatorId, setHostInitiatorId, hostInitiatorGroupId, setHostInitiatorGroupId)}
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

VolumeMappingForm.propTypes = {
  redirect: PropTypes.string.isRequired,
};
VolumeMappingForm.propTypes = {
  storageManagerId: PropTypes.string,
};

VolumeMappingForm.defaultProps = {
  storageManagerId: undefined,
};
export default VolumeMappingForm;
