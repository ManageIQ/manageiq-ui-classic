import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import NetworkRouterForm from '../../components/routers-form/index';

import '../helpers/miqSparkle';
import '../helpers/miqAjaxButton';

describe('Network Router form component', () => {
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;
  let spyMiqAjaxButton;
  const providersMock = [
    {
      href: 'http://localhost:3000/api/providers/31',
      id: '31',
      name: 'Provider 31',
    },
    {
      href: 'http://localhost:3000/api/providers/8',
      id: '8',
      name: 'Provider 8',
    },
  ];

  const options = {
    method: 'OPTIONS',
    backendName: 'API',
    headers: {},
    credentials: 'include',
    body: null,
  };

  const networkMock = {
    href: 'http://localhost:3000/api/network_routers/3',
    id: '3',
    name: 'admin-project-router',
    admin_state_up: true,
    cloud_network_id: '50',
    cloud_tenant_id: '2',
    ems_id: '8',
    ems_ref: '1467fa65-2abe-4002-aa99-02b4087c39ea',
    status: 'ACTIVE',
    type: 'ManageIQ::Providers::Openstack::NetworkManager::NetworkRouter',
    network_group_id: null,
    cloud_network: {
      cloud_subnets: {
        ids: ['1ca5cc3e-ffe1-44cf-94df-98a798489d06'],
      },
    },
    extra_attributes: {
      distributed: false,
      high_availability: false,
      routes: [],
      external_gateway_info: {
        enable_snat: true,
        network_id: '6b3d0c3b-8b68-4c26-a493-5be44d160241',
        external_fixed_ips: [
          {
            subnet_id: '1ca5cc3e-ffe1-44cf-94df-98a798489d06',
            ip_address: '10.9.60.151',
          },
        ],
      },
    },
  };

  beforeEach(() => {
    fetchMock.get(
      '/api/providers?expand=resources&attributes=id,name,supports_create_network_router,type&filter[]=supports_create_network_router=true',
      { resources: providersMock }
    );
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

  it('should render add form', async() => {
    const { container } = renderWithRedux(<NetworkRouterForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render edit variant', async() => {
    // Mock fields structure that matches what loadSchema expects
    // loadSchema accesses fields[2].fields[2], so we need at least 3 top-level fields
    // where the 3rd field has at least 3 nested fields
    const mockFields = [
      {
        component: 'sub-form',
        title: 'Basic Information',
        name: 'basic-info',
        fields: [
          {
            component: 'text-field',
            id: 'name',
            name: 'name',
            label: 'Name',
          },
        ],
      },
      {
        component: 'sub-form',
        title: 'Network Settings',
        name: 'network-settings',
        fields: [
          {
            component: 'checkbox',
            id: 'admin_state_up',
            name: 'admin_state_up',
            label: 'Admin State',
          },
        ],
      },
      {
        component: 'sub-form',
        title: 'External Gateway',
        name: 'external-gateway',
        fields: [
          {
            component: 'checkbox',
            id: 'enable',
            name: 'enable',
            label: 'Enable External Gateway',
          },
          {
            component: 'select',
            id: 'cloud_tenant_id',
            name: 'cloud_tenant_id',
            label: 'Cloud Tenant',
            options: [],
          },
          {
            component: 'select',
            id: 'cloud_network_id',
            name: 'cloud_network_id',
            label: 'External Network',
            options: [],
          },
        ],
      },
    ];

    fetchMock.get('/api/network_routers/3', networkMock);
    fetchMock.get(
      '/api/network_routers/3?attributes=cloud_network.cloud_subnets.ids,external_gateway_info',
      networkMock
    );
    fetchMock.get(
      '/api/cloud_subnets?expand=resources&attributes=name,ems_ref&filter[]=cloud_network_id=50',
      { resources: [] }
    );
    fetchMock.mock(
      '/api/network_routers/3',
      { data: { form_schema: { fields: mockFields } } },
      options
    );
    const { container } = renderWithRedux(<NetworkRouterForm routerId="3" />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
