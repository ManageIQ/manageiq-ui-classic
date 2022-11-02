import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer, { useFormApi } from '@@ddf';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import { Button } from 'carbon-components-react';
import createSchema from './attach-detach-cloud-volume.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const AttachDetachCloudVolumeForm = ({ recordId, isAttach, dropdownChoices, dropdownLabel }) => {
  const [{ isLoading, fields }, setState] = useState({ isLoading: true, fields: [] });

  const loadSchema = (appendState = {}) => ({ data: { form_schema: { fields } } }) => {
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
      isLoading: false,
    }));
  };

  const dropdownOptions = [];
  dropdownChoices.forEach((opt) => {
    dropdownOptions.push({ label: opt[0], value: opt[1].toString() });
  });

  useEffect(() => {
    if (isLoading && isAttach && dropdownLabel == "Instance") {
      API.options(`/api/cloud_volumes/${recordId}?option_action=attach`)
        .then(loadSchema());
    } else if (isLoading && isAttach && dropdownLabel == "Volume") {
      // NOTE We assume all Volumes passed in are of the same provider type as the chosen Instance
      const refVolumeType = dropdownOptions[0]['value'];
      API.options(`/api/cloud_volumes/${refVolumeType}?option_action=attach`)
        .then(loadSchema());
    } else if (isLoading) {
      setState((state) => ({
        ...state,
        isLoading: false,
      }));
    }
  });

  const onSubmit = (values) => {
    miqSparkleOn();

    var vm_id, volume_id, redirectUrl;
    if (dropdownLabel == "Instance") {
      volume_id = recordId;
      vm_id = values.dropdown_id;
      redirectUrl = '/cloud_volume/show_list';
    } else {
      volume_id = values.dropdown_id;
      vm_id = recordId;
      redirectUrl = '/vm_cloud/explorer'
    }

    const resource = {
      vm_id: vm_id,
      device: values.device_mountpoint ? values.device_mountpoint : '',
    };
    const payload = {
      action: isAttach ? 'attach' : 'detach',
      resource,
    };
    const request = API.post(`/api/cloud_volumes/${volume_id}`, payload);

    request.then(() => {
      const message = sprintf(isAttach
        ? __('Attachment of Cloud Volume has been successfully queued.')
        : __('Detachment of Cloud Volume has been successfully queued.'));

      miqRedirectBack(message, 'success', redirectUrl);
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    miqSparkleOn();
    const message = sprintf(isAttach
      ? __('Attaching Cloud Volume was cancelled by the user.')
      : __('Detaching Cloud Volume was cancelled by the user.'));

    var redirectUrl;
    if (dropdownLabel == "Instance") {
      redirectUrl = '/cloud_volume/show_list';
    } else {
      redirectUrl = '/vm_cloud/explorer'
    }
    miqRedirectBack(message, 'warning', redirectUrl);
  };

  return !isLoading && (
    <div className="tasks-form">
      <MiqFormRenderer
        schema={createSchema(dropdownOptions, dropdownLabel, fields)}
        onSubmit={onSubmit}
        onCancel={onCancel}
        canReset
        FormTemplate={(props) => <FormTemplate {...props} isAttach={isAttach} fields={fields} />}
        buttonsLabels={{ submitLabel: isAttach ? __('Attach') : __('Detach') }}
      />
    </div>
  );
};

const verifyIsDisabled = (values, fields) => {
  let isDisabled = true;
  if (values.dropdown_id && (fields[0] && fields[0].isRequired) && values.device_mountpoint) {
    isDisabled = false;
  } else if (values.dropdown_id && !(fields[0] && fields[0].isRequired)) {
    isDisabled = false;
  }
  return isDisabled;
};

const FormTemplate = ({
  isAttach, fields, formFields,
}) => {
  const {
    handleSubmit, onReset, onCancel, getState,
  } = useFormApi();
  const { valid, pristine } = getState();
  const submitLabel = isAttach ? __('Attach') : __('Detach');
  return (
    <form onSubmit={handleSubmit}>
      {formFields}
      <FormSpy>
        {({ values }) => (
          <div className="custom-button-wrapper">
            <Button
              disabled={verifyIsDisabled(values, fields)}
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

AttachDetachCloudVolumeForm.propTypes = {
  recordId: PropTypes.string,
  isAttach: PropTypes.bool,
  dropdownChoices: PropTypes.arrayOf(PropTypes.any),
  dropdownLabel: PropTypes.string,
};
AttachDetachCloudVolumeForm.defaultProps = {
  recordId: undefined,
  isAttach: true,
  dropdownChoices: [],
  dropdownLabel: "",
};

FormTemplate.propTypes = {
  isAttach: PropTypes.bool,
  fields: PropTypes.arrayOf(PropTypes.any),
  formFields: PropTypes.arrayOf(PropTypes.any),
};

FormTemplate.defaultProps = {
  isAttach: true,
  fields: [],
  formFields: [],
};

export default AttachDetachCloudVolumeForm;
