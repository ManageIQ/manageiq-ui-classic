import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import AddRemoveSecurityGroupForm from '../../components/vm-cloud-add-remove-security-group-form';

import '../helpers/miqAjaxButton';

describe('Add/remove security groups form component', () => {
  let submitSpy;
  beforeEach(() => {
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
  });
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });
  it('should render add security group form', async() => {
    const currentSecurityGroups = {
      resources: [{ href: 'http://localhost:3000/api/instances/1850/security_groups/84', id: '84', name: 'default' }],
    };
    const securityGroups = {
      resources: [{ href: 'http://localhost:3000/api/cloud_tenants/2/security_groups/85', id: '85', name: 'loic' }],
    };

    fetchMock.getOnce('/api/instances/1850/security_groups?expand=resources&attributes=id,name', currentSecurityGroups);
    fetchMock.getOnce('/api/instances/1850', { cloud_tenant_id: '2' });
    fetchMock.getOnce('/api/cloud_tenants/2/security_groups?expand=resources&attributes=id,name', securityGroups);

    const { container } = renderWithRedux(<AddRemoveSecurityGroupForm recordId="1850" redirectURL="/vm_cloud/explorer" isAdd />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render remove security group form', async() => {
    const currentSecurityGroups = {
      resources: [{ href: 'http://localhost:3000/api/instances/1850/security_groups/84', id: '84', name: 'default' }],
    };

    fetchMock.getOnce('/api/instances/1850/security_groups?expand=resources&attributes=id,name', currentSecurityGroups);

    const { container } = renderWithRedux(<AddRemoveSecurityGroupForm recordId="1850" redirectURL="/vm_cloud/explorer" isAdd={false} />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should add security group', async() => {
    const currentSecurityGroups = {
      resources: [{ href: 'http://localhost:3000/api/instances/1850/security_groups/84', id: '84', name: 'default' }],
    };
    const securityGroups = {
      resources: [
        { href: 'http://localhost:3000/api/cloud_tenants/2/security_groups/84', id: '84', name: 'default' },
        { href: 'http://localhost:3000/api/cloud_tenants/2/security_groups/85', id: '85', name: 'loic' },
        { href: 'http://localhost:3000/api/cloud_tenants/2/security_groups/284', id: '284', name: 'docs-test' },
        { href: 'http://localhost:3000/api/cloud_tenants/2/security_groups/88', id: '88', name: 'dave' },
        { href: 'http://localhost:3000/api/cloud_tenants/2/security_groups/268', id: '268', name: 'Test Loic' },
        { href: 'http://localhost:3000/api/cloud_tenants/2/security_groups/269', id: '269', name: 'test_loic_1' },
      ],
    };
    const saveObject = {
      name: 'loic',
      action: 'add',
    };
    fetchMock.getOnce('/api/instances/1850/security_groups?expand=resources&attributes=id,name', currentSecurityGroups);
    fetchMock.getOnce('/api/instances/1850', { cloud_tenant_id: '2' });
    fetchMock.getOnce('/api/cloud_tenants/2/security_groups?expand=resources&attributes=id,name', securityGroups);
    fetchMock.postOnce('/api/instances/1850/security_groups/', saveObject);

    const { container } = renderWithRedux(<AddRemoveSecurityGroupForm recordId="1850" redirectURL="/vm_cloud/explorer" isAdd />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should remove security group', async() => {
    const currentSecurityGroups = {
      resources: [{ href: 'http://localhost:3000/api/instances/1850/security_groups/84', id: '84', name: 'default' }],
    };
    const saveObject = {
      name: 'default',
      action: 'remove',
    };
    fetchMock.getOnce('/api/instances/1850/security_groups?expand=resources&attributes=id,name', currentSecurityGroups);
    fetchMock.postOnce('/api/instances/1850/security_groups/', saveObject);

    const { container } = renderWithRedux(<AddRemoveSecurityGroupForm recordId="1850" redirectURL="/vm_cloud/explorer" isAdd={false} />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
