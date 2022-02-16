import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import createSchema from './subnet-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { API } from '../../http_api';

const SubnetForm = ({ recordId }) => {
  const [{ initialValues, isLoading, fields }, setState] = useState({ isLoading: !!recordId, fields: [] });
  const submitLabel = !!recordId ? __('Save') : __('Add');

  const loadSchema = (appendState = {}) => ({ data: { form_schema: { fields } } }) => {
    if (!!recordId && appendState.initialValues.type === 'ManageIQ::Providers::Openstack::NetworkManager::CloudSubnet') {
      Object.assign(fields[0], { isDisabled: true });
      Object.assign(fields[1], { isDisabled: true });
      Object.assign(fields[4], { isDisabled: true });
    }
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
    }));
  };

  const emptySchema = (appendState = {}) => {
    const fields = [];
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
    }));
  };

  useEffect(() => {
    if (recordId) {
      API.get(`/api/cloud_subnets/${recordId}`).then((initialValues) => {
        if (typeof initialValues.cloud_network_id === 'string') {
          initialValues.cloud_network_id = Number(initialValues.cloud_network_id);
        }
        if (typeof initialValues.cloud_tenant_id === 'string') {
          initialValues.cloud_tenant_id = Number(initialValues.cloud_tenant_id);
        }
        API.options(`/api/cloud_subnets?ems_id=${initialValues.ems_id}`).then(loadSchema({ initialValues, isLoading: false }));
      });
    }
  }, [recordId]);

  const onSubmit = (values) => {
    API.get(`/api/providers/${values.ems_id}`).then(({ type }) => {
      if (type === 'ManageIQ::Providers::Openstack::NetworkManager') {
        if (values.ip_version === undefined) {
          values.ip_version = '4';
        }
        if (values.dhcp_enabled === undefined) {
          values.dhcp_enabled = false;
        }
        values.enable_dhcp = values.dhcp_enabled;
        delete values.dhcp_enabled;
        delete Object.assign(values, values.extra_attributes).extra_attributes;
      }
      miqSparkleOn();
      const request = recordId ? API.patch(`/api/cloud_subnets/${recordId}`, values) : API.post('/api/cloud_subnets', values);
      request.then(() => {
        const message = sprintf(recordId
          ? __('Modification of Cloud Subnet %s has been successfully queued')
          : __('Add of Cloud Subnet "%s" has been successfully queued.'),
        values.name);
        miqRedirectBack(message, 'success', '/cloud_subnet/show_list');
      }).catch(miqSparkleOff);
    });
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

  const validation = (values) => {
    const errors = {};
    if (values.ems_id === '-1') {
      errors.ems_id = __('Required');
    }
    return errors;
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(!!recordId, fields, loadSchema, emptySchema)}
      initialValues={initialValues}
      canReset={!!recordId}
      validate={validation}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
      canSubmit={false}
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
