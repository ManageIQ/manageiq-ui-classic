import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import createSchema from './clone-cloud-volume.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const CloneCloudVolumeForm = ({ recordId }) => {
  const [{ isLoading, fields, initialValues }, setState] = useState({ isLoading: true, fields: [] });
  const loadSchema = (appendState = {}) => ({ data: { form_schema: { fields } } }) => {
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
      isLoading: false,
    }));
  };

  useEffect(() => {
    if (isLoading) {
      API.options(`/api/cloud_volumes/${recordId}?option_action=clone`)
        .then(loadSchema());
    }
  });

  const onSubmit = (values) => {
    miqSparkleOn();
    const resource = {
      name: values.name,
    };
    const payload = {
      action: 'clone',
      resource,
    };
    const request = API.post(`/api/cloud_volumes/${recordId}`, payload);

    request.then(() => {
      const message = sprintf(
        __('Cloning of Cloud Volume has been successfully queued.')
      );

      miqRedirectBack(message, 'success', '/cloud_volume/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    miqSparkleOn();
    const message = sprintf(
      __('Cloning Cloud Volume was cancelled by the user.')
    );

    miqRedirectBack(message, 'warning', '/cloud_volume/show_list');
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(fields)}
      onSubmit={onSubmit}
      initialValues={initialValues}
      onCancel={onCancel}
      canReset
      buttonsLabels={{ submitLabel: __('Clone') }}
    />
  );
};

CloneCloudVolumeForm.propTypes = {
  recordId: PropTypes.string,
};
CloneCloudVolumeForm.defaultProps = {
  recordId: undefined,
};

export default CloneCloudVolumeForm;
