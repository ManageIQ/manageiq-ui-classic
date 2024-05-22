import React from 'react';
import { act } from 'react-dom/test-utils';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { mount } from '../helpers/mountForm';
import CloudObjectStoreContainerForm from '../../components/cloud-object-store-container-form';

require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('Cloud Object Store Container form component', () => {
  const attributes = 'attributes=id,name,supports_cloud_object_store_container_create';
  const filter = 'filter[]=supports_cloud_object_store_container_create=true';
  const url = `/api/providers?expand=resources&${attributes}&${filter}`;
  const providerOptions = {
    resources: [
      {
        href: 'http://localhost:3000/api/providers/6',
        id: '6',
        name: 'OpenStack Swift Manager',
        supports_cloud_object_store_container_create: true,
      },
      {
        href: 'http://localhost:3000/api/providers/87',
        id: '87',
        name: 'dummy aws S3 Storage Manager',
        supports_cloud_object_store_container_create: true,
      }],
  };
  const options = {
    method: 'OPTIONS',
    backendName: 'API',
    headers: {},
    credentials: 'include',
    body: null,
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render add cloud object store container form', () => {
    const wrapper = mount(<CloudObjectStoreContainerForm />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should add Openstack cloud object store container', async() => {
    const providerDetails = {
      type: 'ManageIQ::Providers::Openstack::StorageManager::SwiftManager',
      parent_manager: { type: 'ManageIQ::Providers::Openstack::CloudManager' },
    };
    const submitData = {
      name: 'test',
      ems_id: '6',
      cloud_tenant_id: '1',
    };

    fetchMock.get(url, providerOptions);
    fetchMock.mock('/api/cloud_object_store_containers?ems_id=6', { data: { form_schema: { fields: [] } } }, options);
    fetchMock.getOnce('/api/providers/6?attributes=type,parent_manager.type', providerDetails);
    fetchMock.postOnce('/api/cloud_object_store_containers/', { body: submitData, status: 200 });

    await act(async() => {
      const wrapper = mount(<CloudObjectStoreContainerForm />);
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    fetchMock.restore();
  });

  it('should add Amazon cloud object store container', async(done) => {
    const providerDetails = {
      type: 'ManageIQ::Providers::Amazon::StorageManager::S3',
      parent_manager: { type: 'ManageIQ::Providers::Amazon::CloudManager' },
    };
    const submitData = {
      name: 'test',
      ems_id: '87',
      providerRegion: 'us-gov-west-1',
    };
    fetchMock.get(
      // eslint-disable-next-line max-len
      '/api/providers?expand=resources&attributes=id,name,supports_cloud_object_store_container_create&filter[]=supports_cloud_object_store_container_create=true',
      providerOptions
    );
    fetchMock.mock('/api/cloud_object_store_containers?ems_id=87', { data: { form_schema: { fields: [] } } }, options);
    fetchMock.getOnce('/api/providers/6?attributes=type,parent_manager.type', providerDetails);
    fetchMock.postOnce('/api/cloud_object_store_containers/', submitData);
    const wrapper = mount(<CloudObjectStoreContainerForm />);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
