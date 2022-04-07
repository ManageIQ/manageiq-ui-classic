import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './attach-detach-cloud-volume.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const AttachDetachCloudVolumeForm = ({ recordId, storageManagerId, isAttach, vmChoices }) => {
                                                // TODO is storageManagerId neeeded?

  const [{ isLoading, deviceMountpointRequired }, setState] = useState({ isLoading: true, deviceMountpointRequired: true });

  // const [{
  //   initialValues, fields, isLoading, deviceMountpointRequired
  // }, setState] = useState({ });

  const loadSchema = (appendState = {}) => (value) => {
    // miqSparkleOff();
    // setState({
    //   ...appendState,
    //   fields,
    // });
    
    console.log("values")
    console.log(value)
    // { data: { form_schema: { fields } } }
  };

  // const emptySchema = (appendState = {}) => {
  //   const fields = [];
  //   setState((state) => ({
  //     ...state,
  //     ...appendState,
  //     fields,
  //   }));
  // };

  useEffect(() => {

    // this bottom one does id and ems but goes into the id section of the thing in the API code
    // API.get(`/api/cloud_volumes/${recordId}`).then((initialValues) => {
    //   API.options(`/api/cloud_volumes/${recordId}?ems_id_attach=${initialValues.ems_id}`).then(loadSchema()); //{ initialValues, isLoading: false }
    // });
    API.options(`/api/cloud_volumes?ems_id_attach=${storageManagerId}`).then(loadSchema());

    
    if (isLoading) {

      API.get(`/api/cloud_volumes/${recordId}`).then((initialValues) => {
        console.log(initialValues)
        setState((state) => ({
          ...state,
          isLoading: false,
          deviceMountpointRequired: (initialValues.type === 'ManageIQ::Providers::Amazon::StorageManager::Ebs') ? true : false,
        }));
      });
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
      schema={createSchema(isAttach, vmOptions, deviceMountpointRequired)}
      onSubmit={onSubmit}
      onCancel={onCancel}
      canReset
      buttonsLabels={{ submitLabel: isAttach ? __('Attach') : __('Detach') }}
    />
  );
};

AttachDetachCloudVolumeForm.propTypes = {
  recordId: PropTypes.string,
  isAttach: PropTypes.bool,
};
AttachDetachCloudVolumeForm.defaultProps = {
  recordId: undefined,
  isAttach: true,
};

export default AttachDetachCloudVolumeForm;
