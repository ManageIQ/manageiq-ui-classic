import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './pxe-customization-template-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const PxeCustomizationTemplateForm = ({ recordId, copy }) => {
  const [{ initialValues, isLoading }, setState] = useState({ isLoading: !!recordId });
  const submitLabel = !!recordId ? __('Save') : __('Add');
  const disableSubmit = copy && copy !== recordId ? ['invalid'] : ['pristine'];

  useEffect(() => {
    if (recordId) {
      miqSparkleOn();
      API.get(`/api/customization_templates/${recordId}`).then((initialValues) => {
        setState({ initialValues, isLoading: false });
        miqSparkleOff();
      });
    } else if (copy) {
      miqSparkleOn();
      API.get(`/api/customization_templates/${copy}`).then((initialValues) => {
        initialValues.name = `Copy of ${initialValues.name}`;
        setState({ initialValues, isLoading: false });
        miqSparkleOff();
      });
    }
  }, [recordId, copy]);

  const onSubmit = (values) => {
    miqSparkleOn();

    const request = recordId ? API.patch(`/api/customization_templates/${recordId}`, values) : API.post('/api/customization_templates', values);
    request.then(() => {
      const message = sprintf(
        recordId
          ? __('Customization Template "%s" was saved.')
          : __('Customization Template "%s" was added.'),
        values.name,
      );
      miqRedirectBack(message, undefined, '/pxe/explorer');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Customization Template "%s" was cancelled by the user')
        : __('Add of new Customization Template was cancelled by the user'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/pxe/explorer');
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(initialValues)}
      initialValues={initialValues}
      canReset={!!recordId}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
      disableSubmit={disableSubmit}
    />
  );
};

PxeCustomizationTemplateForm.propTypes = {
  recordId: PropTypes.string,
  copy: PropTypes.string,
};
PxeCustomizationTemplateForm.defaultProps = {
  recordId: undefined,
  copy: undefined,
};

export default PxeCustomizationTemplateForm;
