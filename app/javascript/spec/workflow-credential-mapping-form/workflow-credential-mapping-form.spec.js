import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';

import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import WorkflowCredentialMappingForm from '../../components/workflow-credential-mapping-form/index';

describe('Workflow Credential Form Component', () => {
  const authenticationsApi = {
    resources: [
      { name: 'Test Credential', ems_ref: 'test_credential' },
      { name: 'API Credential', ems_ref: 'api_credential' },
    ],
  };

  const configurationScriptPayloadsApi = {
    name: 'test-workflow.asl',
    payload: `{
      "States": {
        "State1": { "Credentials": { "api_user": "$.api_user", "api_password": "$.api_password" } },
        "State2": { "Credentials": { "api_user": "$.api_user", "api_password": "$.api_password" } }
      }
    }`,
    credentials: {
      api_user: { credential_ref: 'api_credential', credential_field: 'userid' },
      api_password: { credential_ref: 'test_credential', credential_field: 'password' },
    },
  };

  const configurationScriptPayloadsApi2 = {
    name: 'test-workflow2.asl',
    payload: `{ "States": { "State1": {}, "State2": {} } }`,
    credentials: {},
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render mapping credentials to the workflow', async(done) => {
    fetchMock.get(
      `/api/authentications?expand=resources&filter[]=type='ManageIQ::Providers::Workflows::AutomationManager::WorkflowCredential'`,
      authenticationsApi,
    );
    fetchMock.get('/api/configuration_script_payloads/1', configurationScriptPayloadsApi);
    let wrapper;

    await act(async() => {
      wrapper = mount(<WorkflowCredentialMappingForm recordId="1" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(2);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should redirect back to show_list page if a workflow has no credentials to map', async(done) => {
    fetchMock.get(
      `/api/authentications?expand=resources&filter[]=type='ManageIQ::Providers::Workflows::AutomationManager::WorkflowCredential'`,
      { resources: [] },
    );
    fetchMock.get('/api/configuration_script_payloads/2', configurationScriptPayloadsApi2);
    let wrapper;

    await act(async() => {
      wrapper = mount(<WorkflowCredentialMappingForm recordId="2" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(2);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
