import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import PhysicalStorageForm from '../../components/physical-storage-form';
import { mount } from '../helpers/mountForm';
import miqRedirectBack from '../../helpers/miq-redirect-back';

require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('Physical storage form component', () => {
  const emsList = {
    resources: [
      { name: 'name1', id: 1 },
      { name: 'name2', id: 2 },
    ],
  };

  const physicalStorageMock = {
    href: 'https://9.151.190.197/api/physical_storages/1',
    id: '1',
    ems_ref: 'd5ed1342-10a6-4604-9de5-f3cbaae5d467',
    uid_ems: null,
    name: 'svc-178',
    type: 'ManageIQ::Providers::Autosde::StorageManager::PhysicalStorage',
    access_state: null,
    health_state: null,
    overall_health_state: null,
    ems_id: '2',
    physical_rack_id: null,
    drive_bays: null,
    enclosures: null,
    canister_slots: null,
    created_at: '2021-08-19T08:54:41Z',
    updated_at: '2021-08-19T08:56:22Z',
    physical_chassis_id: null,
    total_space: null,
    physical_storage_family_id: '1',
    capabilities: {
      compression: [
        'False',
        'True',
      ],
      thin_provision: [
        'False',
        'True',
      ],
    },
    actions: [
      { name: 'edit', method: 'patch', href: 'https://9.151.190.197/api/physical_storages/1' },
      { name: 'edit', method: 'put', href: 'https://9.151.190.197/api/physical_storages/1' },
      { name: 'refresh', method: 'post', href: 'https://9.151.190.197/api/physical_storages/1' },
      { name: 'delete', method: 'post', href: 'https://9.151.190.197/api/physical_storages/1' },
    ],
  };

  const physicalStorageFamilyMock = {
    href: 'https://9.151.190.130/api/providers/2',
    type: 'ManageIQ::Providers::Autosde::StorageManager',
    capabilities: {
      compression: [
        'False',
        'True',
      ],
      thin_provision: [
        'False',
        'True',
      ],
    },
    id: '2',
    physical_storage_families: [
      {
        id: '1',
        name: 'svc',
        version: '1.1',
        ems_id: '2',
        ems_ref: '4689c707-3064-4b1c-b001-7688bd9b5655',
        created_at: '2021-08-29T10:40:21Z',
        updated_at: '2021-08-29T10:40:21Z',
        capabilities: {
          compression: [
            'False',
            'True',
          ],
          thin_provision: [
            'False',
            'True',
          ],
        },
      },

      {
        id: '2', namec: 'xiv', version: '1.1', ems_id: '2', ems_ref: 'b91e94ab-8056-4c61-bec6-00430e9c1e4c', created_at: '2021-08-29T10:40:21Z', updated_at: '2021-08-29T10:40:21Z',
      },
    ],
  };

  beforeEach(() => {

  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render adding form variant', (done) => {
    const wrapper = shallow(<PhysicalStorageForm />);

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render editing form variant', async(done) => {
    fetchMock.getOnce('/api/physical_storages/1', physicalStorageMock);
    fetchMock.mock('/api/physical_storages?ems_id=2', { data: { form_schema: { fields: [] } } }, { method: 'OPTIONS' });
    fetchMock.mock('/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true&filter[]=supports_add_storage=true', emsList);
    fetchMock.mock('/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true', emsList);
    fetchMock.mock('/api/providers/2?attributes=type,physical_storage_families', physicalStorageFamilyMock);

    let wrapper;
    await act(async() => {
      wrapper = mount(<PhysicalStorageForm recordId="1" />);
    });
    expect(fetchMock.called('/api/physical_storages/1')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should call miqRedirectBack when canceling create form', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<PhysicalStorageForm />);
    });
    wrapper.find('button').last().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith('Add of new Physical Storage was cancelled by the user.', 'warning', '/physical_storage/show_list');
    done();
  });
});
