import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import createSchema from './workflow-repository-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { API } from '../../http_api';

const WorkflowRepositoryForm = ({ repositoryId }) => {
  const [{
    initialValues, isLoading, provider,
  }, setState] = useState({
    isLoading: true,
  });

  useEffect(() => {
    if (repositoryId && isLoading) {
      miqSparkleOn();
      const attributes = ['name', 'description', 'scm_url', 'verify_ssl', 'authentication_id', 'scm_branch'];
      API.get(`/api/configuration_script_sources/${repositoryId}?attributes=${attributes.join(',')}`)
        .then((initialValues) => {
          if (initialValues.verify_ssl === 1) {
            initialValues.verify_ssl = true;
          } else if (initialValues === 0) {
            initialValues.verify_ssl = false;
          }
          setState({
            initialValues,
            isLoading: false,
          });
        });
      miqSparkleOff();
    } else if (isLoading) {
      API.get('/api/providers?collection_class=ManageIQ::Providers::Workflows::AutomationManager')
        .then((response) => {
          if (!response.resources.length) {
            add_flash('error', __('Embedded Workflow Provider not found.'));
          } else {
            setState({
              provider: { href: response.resources[0].href },
              isLoading: false,
            });
          }
        });
    }
  });

  const onSubmit = (values) => {
    const data = values;
    if (data.description === undefined) {
      data.description = '';
    }
    if (data.verify_ssl !== true) {
      data.verify_ssl = false;
    }
    if (data.authentication_id === undefined) {
      data.authentication_id = null;
    }
    if (data.scm_branch === undefined) {
      data.scm_branch = '';
    }
    miqSparkleOn();
    let error = '';
    let message = '';
    const url = '/workflow_repository/show_list';
    if (repositoryId) {
      API.put(`/api/configuration_script_sources/${repositoryId}`, data)
        .then((response) => {
          error = !response.success;
          if (error) {
            message = sprintf(__(`Unable to edit Repository "%s": %s`), values.name, response.message);
            miqRedirectBack(message, 'warning', url);
          } else {
            message = sprintf(__(`Edit of Repository "%s" was successfully initiated.`), values.name);
            miqRedirectBack(message, 'success', url);
          }
        });
    } else {
      data.manager_resource = provider;
      API.post('/api/configuration_script_sources/', data)
        .then((response) => {
          error = !response.results[0].success;
          if (error) {
            message = sprintf(__(`Unable to add Repository "%s": %s`), values.name, response.results[0].message);
            miqRedirectBack(message, 'warning', url);
          } else {
            message = sprintf(__(`Add of Repository "%s" was successfully initiated.`), values.name);
            miqRedirectBack(message, 'success', url);
          }
        });
    }
  };

  const onCancel = () => {
    const url = '/workflow_repository/show_list';
    let message = '';
    if (!!repositoryId) {
      message = sprintf(__(`Edit of Repository "%s" cancelled by user.`), initialValues.name);
    } else {
      message = __(`Add of Repository cancelled by user.`);
    }
    miqRedirectBack(message, 'warning', url);
  };

  if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(repositoryId)}
      initialValues={initialValues}
      canReset={!!repositoryId}
      onSubmit={onSubmit}
      onCancel={onCancel}
      canSubmit={false}
    />
  );
};

WorkflowRepositoryForm.propTypes = {
  repositoryId: PropTypes.string,
};

WorkflowRepositoryForm.defaultProps = {
  repositoryId: undefined,
};

export default WorkflowRepositoryForm;
