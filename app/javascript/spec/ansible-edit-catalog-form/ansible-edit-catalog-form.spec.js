import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
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
    mockServiceTemplateResponseForSecondTestCase
} from './mockdata'

ManageIQ.redux.addReducer = ManageIQ.redux.store.injectReducers;

describe('Ansible playbook edit catalog Form Component', () => {

  beforeEach(() => {
    fetchMock.get('/api/currencies/?expand=resources&attributes=id,full_name,symbol,code&sort_by=full_name&sort_order=ascending', currenciesmockData);
    fetchMock.get(`/api/configuration_script_sources?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ConfigurationScriptSource&expand=resources&attributes=id,name&filter[]=region_number=0&sort_by=name&sort_order=ascending`, repositoriesMockData);
    fetchMock.get('/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::MachineCredential&expand=resources&attributes=id,name,options&sort_by=name&sort_order=ascending', MachineCredentialMockData);
    fetchMock.get('/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::VaultCredential&expand=resources&attributes=id,name&sort_by=name&sort_order=ascending', VaultCredentialMockData);
    fetchMock.once('/api/authentications', CloudTypesMockData);
    fetchMock.get('/api/zones/?expand=resources&attributes=id,description,visible&sort_by=description&sort_order=ascending', zonesMockData);
    fetchMock.get('/api/service_catalogs/?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending', availableCatalogMockData);
    fetchMock.get('/api/service_dialogs/?expand=resources&attributes=id,label&sort_by=label&sort_order=ascending', availableDialogMockData)
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render correct form fields initially', async(done) => {
    fetchMock.get('/api/service_templates/148', mockServiceTemplateResponseForFirstTestCase);
    fetchMock.get(`/api/authentications/151`, getSpecificCloudTypeMockData)
    fetchMock.get('/api/configuration_script_sources/18/configuration_script_payloads?expand=resources&filter[]=region_number=0&sort_by=name&sort_order=ascending', playBookOptionsMockData);
    fetchMock.get('/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::OpenstackCredential&expand=resources&attributes=id,name&sort_by=name&sort_order=ascending', cloudCredentailOptions);
    let wrapper;

    await act(async() => {
      wrapper = mount(<AnsiblePlayBookEditCatalogForm initialData={initalDataForFirstTestCase} />);
    });

    // Wait for all the fetch requests to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    wrapper.update();

    expect(wrapper.find('input[name="name"]').prop('value')).toEqual('hh');
    expect(wrapper.find('select[name="config_info.provision.repository_id"]').prop('value')).toEqual('18');
    expect(wrapper.find('select[name="config_info.provision.playbook_id"]').prop('value')).toEqual('168');
    expect(wrapper.find('select[name="config_info.provision.credential_id"]').prop('value')).toEqual('10');
    expect(wrapper.find('select[name="config_info.retirement.repository_id"]').prop('value')).toEqual('18');
    expect(wrapper.find('select[name="config_info.retirement.playbook_id"]').prop('value')).toEqual('168');
    expect(wrapper.find('select[name="config_info.retirement.credential_id"]').prop('value')).toEqual('10');
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should not render some fields in retirement tab when repisotry id is not present in retirement section in inital data', async(done) => {
    fetchMock.get('/api/service_templates/148', mockServiceTemplateResponseForSecondTestCase);
    fetchMock.get(`/api/authentications/151`, getSpecificCloudTypeMockData)
    fetchMock.get('/api/configuration_script_sources/18/configuration_script_payloads?expand=resources&filter[]=region_number=0&sort_by=name&sort_order=ascending', playBookOptionsMockData);
    fetchMock.get('/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::OpenstackCredential&expand=resources&attributes=id,name&sort_by=name&sort_order=ascending', cloudCredentailOptions);
    let wrapper;

    await act(async() => {
      wrapper = mount(<AnsiblePlayBookEditCatalogForm initialData={initalDataForFirstTestCase} />);
    });

    // Wait for all the fetch requests to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    wrapper.update();

    expect(wrapper.find('select[name="config_info.retirement.repository_id"]').prop('value')).toEqual("");
    expect(wrapper.find('select[name="config_info.retirement.playbook_id"]')).toHaveLength(0);
    expect(wrapper.find('select[name="config_info.retirement.credential_id"]')).toHaveLength(0);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render retirement playbook field with empty value when we change the repository id field', async (done) => {
    fetchMock.get('/api/service_templates/148', mockServiceTemplateResponseForSecondTestCase);
    fetchMock.get(`/api/authentications/151`, getSpecificCloudTypeMockData)
    fetchMock.get('/api/configuration_script_sources/18/configuration_script_payloads?expand=resources&filter[]=region_number=0&sort_by=name&sort_order=ascending', playBookOptionsMockData);
    fetchMock.get('/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::OpenstackCredential&expand=resources&attributes=id,name&sort_by=name&sort_order=ascending', cloudCredentailOptions);
  
    let wrapper = mount(<AnsiblePlayBookEditCatalogForm initialData={initalDataForFirstTestCase} />);
  
    await act(async() => {
      // Wait for the component to finish rendering
      await new Promise(resolve => setTimeout(resolve, 0));
      wrapper.update();
  
      // Find the select element and simulate a change event
      const select = wrapper.find('select[name="config_info.retirement.repository_id"]');
      select.simulate('change', { target: { value: "18" } });
    });
  
    // Wait for all the fetch requests to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    wrapper.update();
  
    // Assert that the component has rendered with the new value
    expect(wrapper.find('select[name="config_info.retirement.repository_id"]').prop('value')).toEqual("18");
    expect(wrapper.find('select[name="config_info.retirement.playbook_id"]').prop('value')).toEqual('');

    expect(toJson(wrapper)).toMatchSnapshot();
  
    done();
  });
  
  
});
