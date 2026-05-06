import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhysicalStorageForm from '../../components/physical-storage-form';
import { renderWithRedux } from '../helpers/mountForm';
import miqRedirectBack from '../../helpers/miq-redirect-back';

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
    capabilities: 'Default',
    actions: [
      {
        name: 'edit',
        method: 'patch',
        href: 'https://9.151.190.197/api/physical_storages/1',
      },
      {
        name: 'edit',
        method: 'put',
        href: 'https://9.151.190.197/api/physical_storages/1',
      },
      {
        name: 'refresh',
        method: 'post',
        href: 'https://9.151.190.197/api/physical_storages/1',
      },
      {
        name: 'delete',
        method: 'post',
        href: 'https://9.151.190.197/api/physical_storages/1',
      },
    ],
  };

  const physicalStorageFamilyMock = {
    href: 'https://9.151.190.130/api/providers/2',
    type: 'ManageIQ::Providers::Autosde::StorageManager',
    capabilities: 'Default',
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
        capabilities: 'Default',
      },

      {
        id: '2',
        namec: 'xiv',
        version: '1.1',
        ems_id: '2',
        ems_ref: 'b91e94ab-8056-4c61-bec6-00430e9c1e4c',
        created_at: '2021-08-29T10:40:21Z',
        updated_at: '2021-08-29T10:40:21Z',
      },
    ],
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render adding form variant', async() => {
    fetchMock.mock(
      '/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true&filter[]=supports_add_storage=true',
      emsList
    );

    const { container } = renderWithRedux(<PhysicalStorageForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render editing form variant', async() => {
    fetchMock.get('/api/physical_storages/1', physicalStorageMock);
    fetchMock.mock(
      '/api/physical_storages?ems_id=2',
      { data: { form_schema: { fields: [] } } },
      { method: 'OPTIONS' }
    );
    fetchMock.mock(
      '/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true&filter[]=supports_add_storage=true',
      emsList
    );
    fetchMock.mock(
      '/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true',
      emsList
    );
    fetchMock.mock(
      '/api/providers/2?attributes=type,physical_storage_families',
      physicalStorageFamilyMock
    );

    const { container } = renderWithRedux(<PhysicalStorageForm recordId="1" />);

    await waitFor(() => {
      expect(fetchMock.called('/api/physical_storages/1')).toBe(true);
    });
    expect(container).toMatchSnapshot();
  });

  it('should call miqRedirectBack when canceling create form', async() => {
    fetchMock.mock(
      '/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true&filter[]=supports_add_storage=true',
      emsList
    );

    const user = userEvent.setup();
    const { getByRole } = renderWithRedux(<PhysicalStorageForm />);

    await waitFor(() => {
      expect(getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Add of new Physical Storage was cancelled by the user.',
      'warning',
      '/physical_storage/show_list'
    );
  });
});
