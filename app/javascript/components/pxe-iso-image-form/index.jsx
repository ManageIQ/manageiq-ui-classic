import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './pxe-iso-image-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const PxeIsoImageForm = ({ recordId }) => {
  const [{ initialValues, isLoading }, setState] = useState({ isLoading: !!recordId });
  const submitLabel = __('Save');

  useEffect(() => {
    if (recordId) {
      miqSparkleOn();
      API.get(`/api/iso_images/${recordId}`).then((initialValues) => {
        setState({ initialValues, isLoading: false });
        miqSparkleOff();
      });
    }
  }, [recordId]);

  const onSubmit = (values) => {
    values = {
      action: 'edit',
      pxe_image_type_id: values.pxe_image_type_id ? values.pxe_image_type_id : null,
    };
    miqSparkleOn();

    API.post(`/api/iso_images/${recordId}`, values).then((image) => {
      const message = sprintf(__('ISO Image "%s" was saved.'), image.name);
      miqRedirectBack(message, 'success', '/pxe/explorer');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(__('Edit of ISO Image "%s" was cancelled by the user'), initialValues && initialValues.name);
    miqRedirectBack(message, 'warning', '/pxe/explorer');
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(initialValues)}
      initialValues={initialValues}
      canReset
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
    />
  );
};

PxeIsoImageForm.propTypes = {
  recordId: PropTypes.string,
};
PxeIsoImageForm.defaultProps = {
  recordId: undefined,
};

export default PxeIsoImageForm;
