import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './pxe-image-type-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const PxeImageForm = ({ recordId }) => {
  const [{ initialValues, isLoading }, setState] = useState({ isLoading: !!recordId });
  const submitLabel = !!recordId ? __('Save') : __('Add');

  useEffect(() => {	
    if (recordId) {
      miqSparkleOn();
      API.get(`/api/pxe_image_types/${recordId}`).then(initialValues => {
          setState({ initialValues, isLoading: false });
          miqSparkleOff();
      });
    }
  }, [recordId]);

  const onSubmit = (values) => {
    values = {
      ...values,
      provision_type: values.provision_type ? values.provision_type : null,
    };
    miqSparkleOn();

    const request = recordId ? API.patch(`/api/pxe_image_types/${recordId}`, values) : API.post('/api/pxe_image_types', values);
    request.then(() => {
      const message = sprintf(
        recordId
          ? __('Modification of System Image Type "%s" has been successfully queued.')
          : __('System Image Type "%s" was added.'),
        values.name,
      );
      miqRedirectBack(message, undefined, '/pxe/explorer');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of System Image Type "%s" was cancelled by the user')
        : __('Add of new System Image Type was cancelled by the user'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/pxe/explorer');
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema()}
      initialValues={initialValues}
      canReset={!!recordId}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
    />
  );
};

PxeImageForm.propTypes = {
  recordId: PropTypes.string,
};
PxeImageForm.defaultProps = {
  recordId: undefined,
};

export default PxeImageForm;
