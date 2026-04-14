import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import AnsiblePlayBookEditCatalogForm from '../../components/ansible-playbook-edit-catalog-form';
import {
  initalDataForFirstTestCase,
  mockServiceTemplateResponseForFirstTestCase,
  currenciesmockData,
  repositoriesMockData,
  MachineCredentialMockData,
  VaultCredentialMockData,
  CloudTypesMockData,
  zonesMockData,
  availableCatalogMockData,
  availableDialogMockData,
  getSpecificCloudTypeMockData,
  playBookOptionsMockData,
  cloudCredentailOptions,
  mockServiceTemplateResponseForSecondTestCase,
} from './mockdata';

ManageIQ.redux.addReducer = ManageIQ.redux.store.injectReducers;

describe('Ansible playbook edit catalog Form Component', () => {
  beforeEach(() => {
    fetchMock.get(
      `/api/currencies/?expand=resources&attributes=id,full_name,symbol,code&sort_by=full_name&sort_order=ascending`,
      currenciesmockData
    );
    fetchMock.get(
      `/api/configuration_script_sources?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ConfigurationScriptSource&expand=resources&attributes=id,name&filter[]=region_number=0&sort_by=name&sort_order=ascending`,
      repositoriesMockData
    );
    fetchMock.get(
      `/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::MachineCredential&expand=resources&attributes=id,name,options&sort_by=name&sort_order=ascending`,
      MachineCredentialMockData
    );
    fetchMock.get(
      `/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::VaultCredential&expand=resources&attributes=id,name&sort_by=name&sort_order=ascending`,
      VaultCredentialMockData
    );
    fetchMock.once('/api/authentications', CloudTypesMockData);
    fetchMock.get(
      `/api/zones/?expand=resources&attributes=id,description,visible&sort_by=description&sort_order=ascending`,
      zonesMockData
    );
    fetchMock.get(
      `/api/service_catalogs/?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending`,
      availableCatalogMockData
    );
    fetchMock.get(
      `/api/service_dialogs/?expand=resources&attributes=id,label&sort_by=label&sort_order=ascending`,
      availableDialogMockData
    );
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render correct form fields initially', async() => {
    fetchMock.get('/api/service_templates/148', mockServiceTemplateResponseForFirstTestCase);
    fetchMock.get(`/api/authentications/151`, getSpecificCloudTypeMockData);
    fetchMock.get(
      `/api/configuration_script_sources/18/configuration_script_payloads?expand=resources&filter[]=region_number=0&sort_by=name&sort_order=ascending`,
      playBookOptionsMockData
    );
    fetchMock.get(
      `/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::OpenstackCredential&expand=resources&attributes=id,name&sort_by=name&sort_order=ascending`,
      cloudCredentailOptions
    );

    const { container } = renderWithRedux(
      <AnsiblePlayBookEditCatalogForm initialData={initalDataForFirstTestCase} />
    );

    // Wait for all the fetch requests to complete and form to render
    await waitFor(() => {
      expect(container.querySelector('input[name="name"]')).toBeInTheDocument();
    });

    expect(container.querySelector('input[name="name"]').value).toEqual('hh');
    expect(container.querySelector('select[name="config_info.provision.repository_id"]').value)
      .toEqual('18');
    expect(container.querySelector('select[name="config_info.provision.playbook_id"]').value)
      .toEqual('168');
    expect(container.querySelector('select[name="config_info.provision.credential_id"]').value)
      .toEqual('10');
    expect(container.querySelector('select[name="config_info.retirement.repository_id"]').value)
      .toEqual('18');
    expect(container.querySelector('select[name="config_info.retirement.playbook_id"]').value)
      .toEqual('168');
    expect(container.querySelector('select[name="config_info.retirement.credential_id"]').value)
      .toEqual('10');
    expect(container).toMatchSnapshot();
  });

  it('should not render some fields in retirement tab when repository id is not present in retirement section', async() => {
    fetchMock.get('/api/service_templates/148', mockServiceTemplateResponseForSecondTestCase);
    fetchMock.get(`/api/authentications/151`, getSpecificCloudTypeMockData);
    fetchMock.get(
      `/api/configuration_script_sources/18/configuration_script_payloads?expand=resources&filter[]=region_number=0&sort_by=name&sort_order=ascending`,
      playBookOptionsMockData
    );
    fetchMock.get(
      `/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::OpenstackCredential&expand=resources&attributes=id,name&sort_by=name&sort_order=ascending`,
      cloudCredentailOptions
    );

    const { container } = renderWithRedux(
      <AnsiblePlayBookEditCatalogForm initialData={initalDataForFirstTestCase} />
    );

    // Wait for all the fetch requests to complete and form to render
    await waitFor(() => {
      expect(container.querySelector('select[name="config_info.retirement.repository_id"]'))
        .toBeInTheDocument();
    });

    expect(container.querySelector('select[name="config_info.retirement.repository_id"]').value)
      .toEqual('');
    expect(container.querySelector('select[name="config_info.retirement.playbook_id"]'))
      .not.toBeInTheDocument();
    expect(container.querySelector('select[name="config_info.retirement.credential_id"]'))
      .not.toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render retirement playbook field with empty value when repository id changes', async() => {
    fetchMock.get('/api/service_templates/148', mockServiceTemplateResponseForSecondTestCase);
    fetchMock.get(`/api/authentications/151`, getSpecificCloudTypeMockData);
    fetchMock.get(
      '/api/configuration_script_sources/18/configuration_script_payloads'
        + '?expand=resources&filter[]=region_number=0&sort_by=name&sort_order=ascending',
      playBookOptionsMockData
    );
    fetchMock.get(
      '/api/authentications'
        + '?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::OpenstackCredential'
        + '&expand=resources&attributes=id,name&sort_by=name&sort_order=ascending',
      cloudCredentailOptions
    );

    const user = userEvent.setup();
    const { container } = renderWithRedux(
      <AnsiblePlayBookEditCatalogForm initialData={initalDataForFirstTestCase} />
    );

    // Wait for the component to finish rendering
    await waitFor(() => {
      expect(container.querySelector('select[name="config_info.retirement.repository_id"]')).toBeInTheDocument();
    });

    // Find the select element and trigger change event
    const select = container.querySelector('select[name="config_info.retirement.repository_id"]');
    await user.selectOptions(select, '18');

    // Wait for all the fetch requests to complete
    await waitFor(() => {
      expect(container.querySelector('select[name="config_info.retirement.playbook_id"]')).toBeInTheDocument();
    });

    // Assert that the component has rendered with the new value
    expect(container.querySelector('select[name="config_info.retirement.repository_id"]').value).toEqual('18');
    expect(container.querySelector('select[name="config_info.retirement.playbook_id"]').value).toEqual('');

    expect(container).toMatchSnapshot();
  });
});
