/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './vm-edit-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import handleFailure from '../../helpers/handle-failure';
import {
  getInitialValues, getNoEmsInitialValues, getSubmitData, descriptionData,
} from './helper';

const VmEditForm = ({
  recordId, emsId, displayName, isTemplate, editDescription,
}) => {
  let returnURL = '/vm_infra/explorer/';
  if (displayName === 'Image' || displayName === 'Instance') {
    returnURL = '/vm_cloud/explorer/';
  }

  let URL = `/api/vms/${recordId}`;
  if (isTemplate) {
    URL = `/api/templates/${recordId}`;
  }

  const [{
    initialValues, parentOptions, isLoading,
  }, setState] = useState({
    isLoading: !!recordId,
  });

  const validation = (values) => {
    const errors = {};
    if (values.child_vms && values.child_vms.includes(values.parent_vm)) {
      errors.parent_vm = __('Child VM cannot be the same as Parent VM');
    }
    return errors;
  };

  useEffect(() => {
    if (isLoading && emsId) {
      getInitialValues(emsId, recordId, isTemplate, setState);
    } else if (isLoading) {
      getNoEmsInitialValues(recordId, isTemplate, setState);
    }
  });

  /** Function to update just the description of the record on form submit. */
  const updateDescription = (values) => {
    // const data = descriptionData(values);
    const payload = { action: 'set_description', resource: { new_description: 'test_description' } };
    return API.post(URL, payload)
      .then(() => {
        miqSparkleOn();
        const message = sprintf(__('%s "%s" description was saved'), displayName, initialValues.name);
        miqRedirectBack(message, 'success', returnURL);
      })
      .catch(handleFailure);
  };

  /** Function to update the entire record on form submit. */
  const updateRecord = (values) => {
    const data = getSubmitData(values);
    return API.post(URL, data)
      .then(() => {
        miqSparkleOn();
        const message = sprintf(__('%s "%s" was saved'), displayName, initialValues.name);
        miqRedirectBack(message, 'success', returnURL);
      })
      .catch(handleFailure);
  };

  /** Function to handle the form submit event. */
  const onSubmit = (values) => {
    miqSparkleOn();
    return editDescription ? updateDescription(values) : updateRecord(values);
  };

  /** Function to handle the form cancel event. */
  const onCancel = () => {
    miqSparkleOn();
    let returnURL = '/vm_infra/explorer/';
    if (displayName === 'Image' || displayName === 'Instance') {
      returnURL = '/vm_cloud/explorer/';
    }
    const message = sprintf(__('Edit of %s "%s" was cancelled by the user'), displayName, initialValues.name);
    miqRedirectBack(message, 'success', returnURL);
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(emsId, parentOptions, editDescription)}
      initialValues={initialValues}
      canReset={!!recordId}
      validate={validation}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{
        submitLabel: recordId ? __('Save') : __('Add'),
      }}
    />
  );
};

VmEditForm.propTypes = {
  recordId: PropTypes.string,
  emsId: PropTypes.string,
  displayName: PropTypes.string.isRequired,
  isTemplate: PropTypes.bool.isRequired,
  editDescription: PropTypes.bool.isRequired,
};

VmEditForm.defaultProps = {
  recordId: undefined,
  emsId: undefined,
};

export default VmEditForm;
