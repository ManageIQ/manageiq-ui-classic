import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { CredentialMapperComponent } from '../workflow-credential-mapping-form/helper';
import componentMapper from '../../forms/mappers/componentMapper';
import createSchema from './embedded-terraform-credential-mapping-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const EmbeddedTerraformCredentialMappingForm = ({ recordId }) => {
  const [{
    credentials,
    credentialReferences,
    payloadCredentials,
    workflowAuthentications,
    initialValues,
    isLoading,
  }, setState] = useState({ isLoading: !!recordId });
  const submitLabel = !!recordId ? __('Save') : __('Add');

  // custom component mapper
  const mapper = {
    ...componentMapper,
    'credential-mapper': CredentialMapperComponent,
  };

  useEffect(() => {
    // eslint-disable-next-line camelcase
    API.get(
      `/api/authentications?expand=resources&filter[]=type='ManageIQ::Providers::EmbeddedTerraform::AutomationManager::ScmCredential'`
    ).then(({ resources }) => {
      API.get(`/api/configuration_script_payloads/${recordId}`).then(({ name, payload, credentials }) => {
        const initialCredentials = credentials != null ? credentials : {};

        /*
          Creates the list of credential references from the workflow payload by parsing each state and saving them to payloadCredentials.
          Duplicate references get overridden.
        */
        const jsonPayload = JSON.parse(payload).States;
        let payloadCredentials = {};

        Object.keys(jsonPayload).forEach((key1) => {
          if (jsonPayload[key1].Credentials != null) {
            Object.keys(jsonPayload[key1].Credentials).forEach((key2) => {
              payloadCredentials = {
                [key2]: jsonPayload[key1].Credentials[key2],
                ...payloadCredentials,
              };
            });
          }
        });

        // Returns the user to the show_list page if the workflow has no credential references in it's payload
        if (Object.keys(payloadCredentials).length === 0) {
          miqRedirectBack(__('Workflow does not have any credentials to map.'), 'error', '/embedded_terraform_workflow/show_list');
        }

        /*
          payloadCredentials -> list of credential references for this workflow
          workflowAuthentications -> list of available workflow credentials
          credentials -> List of currently mapped reference-credential parings
        */
        setState({
          payloadCredentials,
          workflowAuthentications: Object.keys(resources).map((key) => ({
            value: resources[key].ems_ref,
            label: resources[key].name,
          })),
          credentials: initialCredentials,
          initialValues: {
            name,
            credentials: initialCredentials,
          },
          isLoading: false,
        });
      }).catch((error) => {
        const message = __('Embedded Terraform service is not available.');
        miqRedirectBack(error || message, 'error', '/embedded_terraform_workflow/show_list');
      });
    }).catch(() => {
      const message = __('Embedded Terraform service is not available.');
      miqRedirectBack(message, 'error', '/embedded_terraform_workflow/show_list');
    });
  }, []);

  const onSubmit = () => {
    miqSparkleOn();

    const submission = { credentials };

    const request = API.patch(`/api/configuration_script_payloads/${recordId}`, submission);
    request.then(() => {
      const message = sprintf(__('Credential Mapping for "%s" was saved.'), initialValues.name);
      miqRedirectBack(message, undefined, '/embedded_terraform_workflow/show_list');
    }).catch(miqSparkleOff);
  };

  const onReset = () => {
    setState((state) => ({
      ...state,
      credentials: state.initialValues.credentials,
    }));
  };

  const onCancel = () => {
    const message = sprintf(__('Credential Mapping for "%s" was canceled by the user.'), initialValues && initialValues.name);
    miqRedirectBack(message, 'warning', '/embedded_terraform_workflow/show_list');
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(credentials, credentialReferences, payloadCredentials, workflowAuthentications, setState)}
      initialValues={initialValues}
      componentMapper={mapper}
      canReset={!!recordId}
      onReset={onReset}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
    />
  );
};

EmbeddedTerraformCredentialMappingForm.propTypes = {
  recordId: PropTypes.string,
};
EmbeddedTerraformCredentialMappingForm.defaultProps = {
  recordId: undefined,
};

export default EmbeddedTerraformCredentialMappingForm;
