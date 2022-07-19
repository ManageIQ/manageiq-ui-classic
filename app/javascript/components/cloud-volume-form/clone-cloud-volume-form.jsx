import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer, { useFormApi } from '@@ddf';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import { Button } from 'carbon-components-react';
import createSchema from './clone-cloud-volume.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const CloneCloudVolumeForm = ({ recordId }) => {
  const [{ isLoading, fields }, setState] = useState({ isLoading: true, fields: [] });

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
        __('Cloning of Cloud Volume has been successfully queued.'));

      miqRedirectBack(message, 'success', '/cloud_volume/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    miqSparkleOn();
    const message = sprintf(
      __('Cloning Cloud Volume was cancelled by the user.'));

    miqRedirectBack(message, 'warning', '/cloud_volume/show_list');
  };

  return !isLoading && (
    <div className="tasks-form">
      <MiqFormRenderer
        schema={createSchema(fields)}
        onSubmit={onSubmit}
        onCancel={onCancel}
        canReset
        FormTemplate={(props) => <FormTemplate {...props} fields={fields} />}
        buttonsLabels={{ submitLabel: __('Clone')}}
      />
    </div>
  );
};

const verifyIsDisabled = (values) => {
  let isDisabled = true;
  if (values.name){
    isDisabled = false;
  }
  return isDisabled;
};

const FormTemplate = ({
  fields, formFields,
}) => {
  const {
    handleSubmit, onReset, onCancel, getState,
  } = useFormApi();
  const { valid, pristine } = getState();
  const submitLabel = __('Clone');
  return (
    <form onSubmit={handleSubmit}>
      {formFields}
      <FormSpy>
        {({ values }) => (
          <div className="custom-button-wrapper">
            <Button
              disabled={verifyIsDisabled(values)}
              kind="primary"
              className="btnRight"
              type="submit"
              id="submit"
              variant="contained"
            >
              {submitLabel}
            </Button>

            <Button
              disabled={!valid && pristine}
              kind="secondary"
              className="btnRight"
              variant="contained"
              onClick={onReset}
              type="button"
              id="reset"
            >
              { __('Reset')}
            </Button>

            <Button variant="contained" type="button" onClick={onCancel} kind="secondary">
              { __('Cancel')}
            </Button>
          </div>
        )}
      </FormSpy>
    </form>
  );
};


CloneCloudVolumeForm.propTypes = {
  recordId: PropTypes.string,
};
CloneCloudVolumeForm.defaultProps = {
  recordId: undefined,
};

FormTemplate.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.any),
  formFields: PropTypes.arrayOf(PropTypes.any),
};

FormTemplate.defaultProps = {
  fields: [],
  formFields: [],
};

export default CloneCloudVolumeForm;

