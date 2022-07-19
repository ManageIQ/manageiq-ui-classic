import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import createSchema from './network-security-groups-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { API } from '../../http_api';
import { getFirewallRules } from './helper';

const NetworkSecurityGroupsForm = ({ securityGroupId }) => {
  const [{
    initialValues, isLoading, fields, subnets,
  }, setState] = useState({
    isLoading: !!securityGroupId, fields: [], subnetSelect: [], subnets: [],
  });
  const submitLabel = !!securityGroupId ? __('Save') : __('Add');

  const loadSchema = (appendState = {}) => ({ data: { form_schema: { fields } } }) => {
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
    }));
  };

  const emptySchema = (appendState = {}) => {
    const fields = [];
    const subnetSelect = [];
    setState((state) => ({
      ...state,
      ...appendState,
      fields,
      subnetSelect,
    }));
  };

  useEffect(() => {
    if (securityGroupId && isLoading) {
      miqSparkleOn();
      // eslint-disable-next-line max-len
      API.get(`/api/security_groups/${securityGroupId}?attributes=name,ext_management_system.name,description,cloud_tenant,firewall_rules,ems_id`)
        .then((initialValues) => {
          setState({
            initialValues,
            isLoading: false,
          });
          API.options(`/api/security_groups/${securityGroupId}`).then(
            loadSchema({})
          );
          miqSparkleOff();
        });
    }
  }, [securityGroupId]);

  const onSubmit = (values) => {
    const data = { ...values };
    delete data.firewall_rules;
    let url;
    if (securityGroupId) {
      data.cloud_tenant = { name: initialValues.cloud_tenant.name };
      data.ext_management_system = initialValues.ext_management_system;
      data.firewall_rules_delete = false;
      data.href = initialValues.href;
      data.id = initialValues.id;

      const temp = getFirewallRules(initialValues, values, securityGroupId);
      data.firewall_rules = temp.firewall_rules;
      data.firewall_rules_delete = temp.firewall_rules_delete;

      url = `/security_group/update/${securityGroupId}?button=save`;
      miqAjaxButton(url, data, { complete: false });
    } else {
      data.firewall_rules = [];
      if (data.description === undefined) {
        data.description = '';
      }
      url = 'create/new?button=add';
      miqAjaxButton(url, data, { complete: false });
    }
  };

  const onCancel = () => {
    let message;
    let url;
    if (securityGroupId) {
      message = sprintf(__(`Edit of Security Group "%s" was cancelled by the user`), initialValues.name);
      url = `/security_group/show/${securityGroupId}#`;
    } else {
      message = __('Add of new Security Group was cancelled by the user');
      url = '/security_group/show_list#/';
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

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(securityGroupId, fields, subnets, loadSchema, emptySchema)}
      initialValues={initialValues}
      canReset={!!securityGroupId}
      validate={validation}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
      canSubmit={false}
    />
  );
};

NetworkSecurityGroupsForm.propTypes = {
  securityGroupId: PropTypes.string,
};
NetworkSecurityGroupsForm.defaultProps = {
  securityGroupId: undefined,
};

export default NetworkSecurityGroupsForm;
