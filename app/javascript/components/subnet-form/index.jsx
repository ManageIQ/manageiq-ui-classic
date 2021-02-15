import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import createSchema from './subnet-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const SubnetForm = ({ recordId }) => {
  const [{ initialValues, isLoading, fields }, setState] = useState({ isLoading: !!recordId, fields: [] });
  const submitLabel = !!recordId ? __('Save') : __('Add');

  const loadSchema = (appendState = {}) => ({ data: { form_schema: { fields } } }) => {
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
    }));
  };

  useEffect(() => {
    if (recordId) {
      API.get(`/api/cloud_subnets/${recordId}`).then((initialValues) => {
        API.options(`/api/cloud_subnets?ems_id=${initialValues.ems_id}`).then(loadSchema({ initialValues, isLoading: false }));
      });
    }
    setState({ initialValues, isLoading: false });
  }, [recordId]);

  const onSubmit = (values) => {
    miqSparkleOn();
    const request = recordId ? API.patch(`/api/cloud_subnets/${recordId}`, values) : API.post('/api/cloud_subnets', values);

    request.then(() => {
      const message = sprintf(recordId
        ? __('Modification of Cloud Subnet %s has been successfully queued')
        : __('Add of Cloud Subnet "%s" has been successfully queued.'),
      values.name);

      miqRedirectBack(message, 'success', '/cloud_subnet/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    const message = sprintf(
      recordId
        ? __('Edit of Cloud Subnet "%s" was canceled by the user.')
        : __('Creation of new Cloud Subnet was canceled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/cloud_subnet/show_list');
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(!!recordId, fields, loadSchema)}
      initialValues={initialValues}
      canReset={!!recordId}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
    />
  );
};

SubnetForm.propTypes = {
  recordId: PropTypes.string,
};
SubnetForm.defaultProps = {
  recordId: undefined,
};

export default SubnetForm;
