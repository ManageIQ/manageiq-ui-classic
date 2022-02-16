import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './network-floatingIPs-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { networkProviders } from './helper';

const NetworkFloatingIPsForm = ({
  recordId,
}) => {
  const [{
    ems, initialValues, isLoading, fields,
  }, setState] = useState({
    fields: [],
    isLoading: !!recordId,
    ems: [],
  });

  const loadSchema = (appendState = {}) => ({
    data: {
      // eslint-disable-next-line camelcase
      form_schema: { fields },
    },
  }) =>
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
    }));

  useEffect(() => {
    if (recordId) {
      API.get(`/api/floating_ips/${recordId}?attributes=ext_management_system.name`).then((initialValues) => {
        API.options(`/api/floating_ips/${recordId}?ems_id=${initialValues.ems_id}`).then(loadSchema({
          initialValues: { ...initialValues, cloud_tenant: initialValues.cloud_tenant_id },
          ems: [{ id: initialValues.ems_id, name: initialValues.ext_management_system.name }],
          isLoading: false,
        }));
      });
      API.options(`/api/floating_ips/${recordId}`).then(
        loadSchema({})
      );
    } else {
      networkProviders().then((providers) => {
        setState({
          ems: [...providers],
          isLoading: false,
        });
      });
    }
  }, [recordId]);

  const submitLabel = !!recordId ? __('Save') : __('Add');

  const emptySchema = (appendState = {}) =>
    setState((state) => ({
      ...state,
      ...appendState,
      fields: [],
    }));

  const onSubmit = (values) => {
    miqSparkleOn();

    const request = recordId ? API.patch(`/api/floating_ips/${recordId}`, values) : API.post('/api/floating_ips', values);
    request.then(() => {
      const message = sprintf(
        recordId
          ? __('New floating IPs "%s" has been successfully queued.')
          : __('Add of floating IPs "%s" has been successfully queued.'),
        values.fixed_ip_address,
      );
      miqRedirectBack(message, 'success', '/floating_ip/show_list');
    }).catch(miqSparkleOff);
  };

  const onCancel = () => {
    let url = '';
    const message = sprintf(
      recordId
        ? __('Edit of floating IPs "%s" was canceled by the user.')
        : __('Creation of new floating IPs was canceled by the user.'),
      initialValues && initialValues.address,
    );

    if (recordId) {
      url = `/floating_ip/show/${recordId}`;
    } else {
      url = '/floating_ip/show_list';
    }

    miqRedirectBack(message, 'warning', url);
  };

  const validation = (values) => {
    const errors = {};
    if (values.ems_id === '-1') {
      errors.ems_id = __('Required');
    }
    return errors;
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(ems, !!recordId, loadSchema, emptySchema, fields)}
      initialValues={initialValues}
      canReset={!!recordId}
      validate={validation}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
    />
  );
};

NetworkFloatingIPsForm.propTypes = {
  recordId: PropTypes.string,
};

NetworkFloatingIPsForm.defaultProps = {
  recordId: undefined,
};

export default NetworkFloatingIPsForm;
