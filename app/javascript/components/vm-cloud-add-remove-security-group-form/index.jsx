/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import MiqFormRenderer from '../../forms/data-driven-form';
import createSchema from './vm-cloud-add-security-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const AddRemoveSecurityGroupForm = ({
  recordId, redirectURL, isAdd,
}) => {
  const [{
    isLoading, securityGroups,
  }, setState] = useState({
    isLoading: !!recordId,
  });

  const getSecurityGroups = (currentSecurityGroups) => {
    API.get(`/api/instances/${recordId}`).then((data) => {
      API.get(`/api/cloud_tenants/${data.cloud_tenant_id}/security_groups?expand=resources&attributes=id,name`)
        .then((data) => {
          const securityGroups = [];
          data.resources.forEach((securityGroup) => {
            if (!currentSecurityGroups.includes(securityGroup.id)) {
              securityGroups.push({ label: securityGroup.name, value: securityGroup.name });
            }
          });
          setState({
            securityGroups,
            isLoading: false,
          });
        });
    });
  };

  useEffect(() => {
    if (isAdd && isLoading) {
      API.get(`/api/instances/${recordId}/security_groups?expand=resources&attributes=id,name`)
        .then((data) => {
          const currentSecurityGroups = [];
          data.resources.forEach((securityGroup) => {
            currentSecurityGroups.push(securityGroup.id);
          });
          return currentSecurityGroups;
        }).then((currentSecurityGroups) => {
          getSecurityGroups(currentSecurityGroups);
        });
    } else if (isLoading) {
      API.get(`/api/instances/${recordId}/security_groups?expand=resources&attributes=id,name`)
        .then((data) => {
          const currentSecurityGroups = [];
          data.resources.forEach((securityGroup) => {
            currentSecurityGroups.push({ label: securityGroup.name, value: securityGroup.name });
          });
          setState({
            securityGroups: currentSecurityGroups,
            isLoading: false,
          });
        });
    }
  });

  const onSubmit = (values) => {
    let message = __(`${values.security_group} has been successfully removed.`);
    if (isAdd) {
      const saveObject = {
        name: values.security_group,
        action: 'add',
      };
      message = __(`${values.security_group} has been successfully added.`);
      miqSparkleOn();
      API.post(`/api/instances/${recordId}/security_groups/`, saveObject)
        .then(miqRedirectBack(message, 'success', redirectURL));
    } else {
      const saveObject = {
        name: values.security_group,
        action: 'remove',
      };
      miqSparkleOn();
      API.post(`/api/instances/${recordId}/security_groups/`, saveObject)
        .then(miqRedirectBack(message, 'success', redirectURL));
    }
  };

  const onCancel = () => {
    let message = __('Removal of security group was canceled by the user.');
    miqSparkleOn();
    if (isAdd) {
      message = __('Addition of security group was canceled by the user.');
      miqRedirectBack(message, 'success', redirectURL);
    } else {
      miqRedirectBack(message, 'success', redirectURL);
    }
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(securityGroups)}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{
        submitLabel: recordId ? __('Save') : __('Add'),
      }}
    />
  );
};

AddRemoveSecurityGroupForm.propTypes = {
  recordId: PropTypes.string.isRequired,
  redirectURL: PropTypes.string.isRequired,
  isAdd: PropTypes.bool,
};

AddRemoveSecurityGroupForm.defaultProps = {
  isAdd: false,
};

export default AddRemoveSecurityGroupForm;
