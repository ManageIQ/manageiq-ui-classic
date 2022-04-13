import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer, { componentTypes } from '@@ddf';
import createSchema from './attach-detach-cloud-volume.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const AttachDetachCloudVolumeForm = ({ recordId, storageManagerId, isAttach, vmChoices }) => {
                                                // TODO is storageManagerId neeeded?

  const [{ isLoading, fields }, setState] = useState({ isLoading: true, fields: [] });

  const loadSchema = (appendState = {}) => ({ data: { form_schema: { fields } } }) => {
    var finalFields = fields ? fields : 
    [{
      component: componentTypes.TEXT_FIELD,
      id: 'device_mountpoint',
      name: 'device_mountpoint',
      label: __('Device Mountpoint'),
      isRequired: false,
    }]; 
    setState((state) => ({
      ...state,
      ...appendState,
      fields: isAttach ? finalFields : [],
      isLoading: false,
    }));
  };

  useEffect(() => {
    if(isLoading) {
      API.options(`/api/cloud_volumes/${recordId}?action=attach&option_action=attach`).then(loadSchema());
    }
  });

  const vmOptions = [];
  vmChoices.forEach((vm) => {
    vmOptions.push({ label: vm[0], value: vm[1].toString() });
  });

  const onSubmit = (values) => {
    console.log(values)
    miqSparkleOn();
    const resource = {
      vm_id: values.vm_id,
      device: values.device_mountpoint ? values.device_mountpoint : "",
    };
    const payload = {
      action: isAttach ? 'attach' : 'detach',
      resource,
    };
    const request = API.post(`/api/cloud_volumes/${recordId}`, payload);

    request.then(() => {
      const message = sprintf(isAttach
        ? __('Attachment of Cloud Volume has been successfully queued.')
        : __('Detachment of Cloud Volume of Host has been successfully queued.'));

      miqRedirectBack(message, 'success', '/cloud_volume/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    miqSparkleOn();
    const message = sprintf(isAttach
      ? __('Attaching Cloud Volume was cancelled by the user.')
      : __('Detaching Cloud Volume was cancelled by the user.'));

    miqRedirectBack(message, 'warning', '/cloud_volume/show_list');
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(vmOptions, fields)}
      onSubmit={onSubmit}
      onCancel={onCancel}
      canReset
      buttonsLabels={{ submitLabel: isAttach ? __('Attach') : __('Detach') }}
    />
  );
}; // TODO: the not requirered device mountpoint, on change, makes the attach button blue, needs to fix that

AttachDetachCloudVolumeForm.propTypes = {
  recordId: PropTypes.string,
  isAttach: PropTypes.bool,
};
AttachDetachCloudVolumeForm.defaultProps = {
  recordId: undefined,
  isAttach: true,
};

export default AttachDetachCloudVolumeForm;
