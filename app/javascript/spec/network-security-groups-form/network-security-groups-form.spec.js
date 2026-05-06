import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import NetworkSecurityGroupsForm from '../../components/network-security-groups-form';

import '../helpers/miqSparkle';
import '../helpers/miqAjaxButton';

describe('Network Security Groups Form Component', () => {
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;
  let spyMiqAjaxButton;

  const securityGroupId = '82';
  const providers = {
    resources: [
      {
        id: '54',
        parent_ems_id: '22',
        tenant_id: '1',
        type: 'ManageIQ::Providers::Redhat::NetworkManager',
        zone_id: '9',
        name: 'RHV Network Manager',
      },
      {
        id: '31',
        parent_ems_id: '30',
        tenant_id: '1',
        type: 'ManageIQ::Providers::Openstack::NetworkManager',
        zone_id: '8',
        name: 'OpenStack Director Network Manager',
      },
    ],
  };

  const optionsResponse = {
    data: {
      form_schema: {
        fields: [],
      },
    },
  };

  const firewallRules = [
    {
      created_on: '2017-10-06T16:57:17Z',
      direction: 'outbound',
      display_name: null,
      ems_ref: '12ff3723-d9a3-423c-9033-6eed53d0811a',
      enabled: null,
      end_port: null,
      group: null,
      host_protocol: '',
      id: '461',
      name: null,
      network_protocol: 'IPV4',
      port: null,
      required: null,
      resource_id: '82',
      resource_type: 'SecurityGroup',
      source_ip_range: null,
      source_security_group_id: null,
      updated_on: '2017-10-06T16:57:17Z',
    },
    {
      created_on: '2017-10-06T16:57:17Z',
      direction: 'inbound',
      display_name: null,
      ems_ref: '4428d6bf-ab6d-4de9-a8eb-74c4aeed2595',
      enabled: null,
      end_port: 22,
      group: null,
      host_protocol: 'TCP',
      id: '463',
      name: null,
      network_protocol: 'IPV4',
      port: 22,
      required: null,
      resource_id: '82',
      resource_type: 'SecurityGroup',
      source_ip_range: '0.0.0.0/0',
      source_security_group_id: null,
      updated_on: '2017-10-06T16:57:17Z',
    },
  ];

  const securityGroup = {
    cloud_tenant: {
      created_at: '2017-10-06T16:56:43Z',
      description: '',
      ems_id: '7',
      ems_ref: '074ea3f5f49c47dc87d21c3f1b4d53fa',
      enabled: true,
      id: '1',
      name: 'cloud-user-demo',
      parent_id: null,
      type: 'ManageIQ::Providers::Openstack::CloudManager::CloudTenant',
      updated_at: '2017-10-06T16:56:43Z',
    },
    description: '',
    ems_id: '8',
    ext_management_system: {
      name: 'OpenStack Network Manager',
    },
    firewall_rules: firewallRules,
    href: 'http://localhost:3000/api/security_groups/82',
    id: '82',
    name: 'asimonel-sg',
  };

  beforeEach(() => {
    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
    spyMiqAjaxButton = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
    spyMiqAjaxButton.mockRestore();
  });

  it('should render add security group form', async() => {
    fetchMock.get(
      '/api/providers?&expand=resources&filter[]=supports_create_security_group=true',
      providers
    );

    const { container } = renderWithRedux(<NetworkSecurityGroupsForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render edit security group form', async() => {
    fetchMock.get(
      '/api/providers?&expand=resources&filter[]=supports_create_security_group=true',
      providers
    );
    fetchMock.get(
      `/api/security_groups/${securityGroupId}?attributes=name,ext_management_system.name,description,cloud_tenant,firewall_rules,ems_id`,
      securityGroup
    );
    fetchMock.mock(`/api/security_groups/${securityGroupId}`, optionsResponse, {
      method: 'OPTIONS',
    });

    const { container } = renderWithRedux(
      <NetworkSecurityGroupsForm securityGroupId={securityGroupId} />
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should add security group', async() => {
    fetchMock.get(
      '/api/providers?&expand=resources&filter[]=supports_create_security_group=true',
      providers
    );

    const { container } = renderWithRedux(<NetworkSecurityGroupsForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    const addSecurityGroup = {
      ems_id: '8',
      name: '00',
      description: '1',
      cloud_tenant_id: '2',
      firewall_rules: [],
    };
    miqAjaxButton(
      `/security_group/update/${securityGroupId}?button=save`,
      addSecurityGroup,
      { complete: false }
    );
    expect(spyMiqAjaxButton).toHaveBeenCalledWith(
      `/security_group/update/${securityGroupId}?button=save`,
      addSecurityGroup,
      { complete: false }
    );
    expect(container).toMatchSnapshot();
  });

  it('should edit security group', async() => {
    fetchMock.get(
      '/api/providers?&expand=resources&filter[]=supports_create_security_group=true',
      providers
    );
    fetchMock.get(
      `/api/security_groups/${securityGroupId}?attributes=name,ext_management_system.name,description,cloud_tenant,firewall_rules,ems_id`,
      securityGroup
    );
    fetchMock.mock(`/api/security_groups/${securityGroupId}`, optionsResponse, {
      method: 'OPTIONS',
    });

    const { container } = renderWithRedux(
      <NetworkSecurityGroupsForm securityGroupId={securityGroupId} />
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    const editSecurityGroup = {
      cloud_tenant: {
        name: 'cloud-user-demo',
      },
      description: '',
      ems_id: '8',
      ext_management_system: {
        name: 'OpenStack Network Manager',
      },
      firewall_rules: firewallRules,
      firewall_rules_delete: false,
      href: 'http://localhost:3000/api/security_groups/82',
      id: '82',
      name: 'asimonel-sg',
    };
    miqAjaxButton(
      `/security_group/update/${securityGroupId}?button=save`,
      editSecurityGroup,
      { complete: false }
    );
    expect(spyMiqAjaxButton).toHaveBeenCalledWith(
      `/security_group/update/${securityGroupId}?button=save`,
      editSecurityGroup,
      { complete: false }
    );
    expect(container).toMatchSnapshot();
  });

  it('should edit security group firewall rules', async() => {
    fetchMock.get(
      '/api/providers?&expand=resources&filter[]=supports_create_security_group=true',
      providers
    );
    fetchMock.get(
      `/api/security_groups/${securityGroupId}?attributes=name,ext_management_system.name,description,cloud_tenant,firewall_rules,ems_id`,
      securityGroup
    );
    fetchMock.mock(`/api/security_groups/${securityGroupId}`, optionsResponse, {
      method: 'OPTIONS',
    });

    const { container } = renderWithRedux(
      <NetworkSecurityGroupsForm securityGroupId={securityGroupId} />
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    const editedFirewallRules = [
      {
        created_on: '2017-10-06T16:57:17Z',
        direction: 'outbound',
        display_name: null,
        ems_ref: '12ff3723-d9a3-423c-9033-6eed53d0811a',
        enabled: null,
        end_port: null,
        group: null,
        host_protocol: '',
        id: '461',
        name: null,
        network_protocol: 'IPV4',
        port: null,
        required: null,
        resource_id: '82',
        resource_type: 'SecurityGroup',
        source_ip_range: null,
        source_security_group_id: null,
        updated_on: '2017-10-06T16:57:17Z',
      },
      {
        created_on: '2017-10-06T16:57:17Z',
        direction: 'inbound',
        display_name: null,
        ems_ref: '4428d6bf-ab6d-4de9-a8eb-74c4aeed2595',
        enabled: null,
        end_port: 22,
        group: null,
        host_protocol: 'TCP',
        id: '463',
        name: null,
        network_protocol: 'IPV4',
        port: 22,
        required: null,
        resource_id: '82',
        resource_type: 'SecurityGroup',
        source_ip_range: '0.0.0.0/0',
        source_security_group_id: null,
        updated_on: '2017-10-06T16:57:17Z',
      },
    ];
    const editSecurityGroup = {
      cloud_tenant: {
        name: 'cloud-user-demo',
      },
      description: '',
      ems_id: '8',
      ext_management_system: {
        name: 'OpenStack Network Manager',
      },
      firewall_rules: editedFirewallRules,
      firewall_rules_delete: false,
      href: 'http://localhost:3000/api/security_groups/82',
      id: '82',
      name: 'asimonel-sg',
    };
    miqAjaxButton(
      `/security_group/update/${securityGroupId}?button=save`,
      editSecurityGroup,
      { complete: false }
    );
    expect(spyMiqAjaxButton).toHaveBeenCalledWith(
      `/security_group/update/${securityGroupId}?button=save`,
      editSecurityGroup,
      { complete: false }
    );
    expect(container).toMatchSnapshot();
  });
});
