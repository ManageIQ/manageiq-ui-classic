import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import InterfacesForm from '../../components/network-routers-interfaces-form';

import '../helpers/miqSparkle';
import '../helpers/miqAjaxButton';

describe('Network Router Interfaces Form Component', () => {
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;
  let spyMiqAjaxButton;
  const networkRouter = {
    admin_state_up: true,
    cloud_network_id: 50,
    cloud_tenant: { name: 'admin' },
    ext_management_system: { id: '8', name: 'Openstack Network Manager' },
    extra_attributes: {
      distributed: false,
      routes: [],
      high_availability: false,
      external_gateway_info: {
        enable_snat: true,
        external_fixed_ips: [
          {
            subnet_id: '1ca5cc3e-ffe1-44cf-94df-98a798489d06',
            ip_address: '10.9.60.151',
          },
        ],
        network_id: '6b3d0c3b-8b68-4c26-a493-5be44d160241',
      },
    },
  };
  const initialInterface = {
    resources: [
      {
        href: 'http://localhost:3000/api/cloud_subnets/50',
        id: '50',
        name: 'ext-sub',
      },
    ],
  };
  const interfaces = { 'pat-subnwt': 148, 'ext-sub': 50 };
  const removeinterfaces = { 'admin-project-subnet': 57 };
  const routerId = '3';

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

  it('should render add interface form', async() => {
    fetchMock.getOnce(
      // eslint-disable-next-line max-len
      `/api/network_routers/3?attributes=name,admin_state_up,cloud_network_id,cloud_tenant.name,ext_management_system.id,ext_management_system.name,extra_attributes`,
      networkRouter
    );
    fetchMock.getOnce(
      '/api/cloud_subnets?expand=resources&attributes=name&filter[]=ems_ref=1ca5cc3e-ffe1-44cf-94df-98a798489d06',
      initialInterface
    );

    const { container } = renderWithRedux(
      <InterfacesForm interfaces={interfaces} add routerId={routerId} />
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render remove interface form', async() => {
    fetchMock.getOnce(
      // eslint-disable-next-line max-len
      `/api/network_routers/3?attributes=name,admin_state_up,cloud_network_id,cloud_tenant.name,ext_management_system.id,ext_management_system.name,extra_attributes`,
      networkRouter
    );
    fetchMock.getOnce(
      '/api/cloud_subnets?expand=resources&attributes=name&filter[]=ems_ref=1ca5cc3e-ffe1-44cf-94df-98a798489d06',
      initialInterface
    );

    const { container } = renderWithRedux(
      <InterfacesForm interfaces={interfaces} add={false} routerId={routerId} />
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should add interface', async() => {
    const { container } = renderWithRedux(
      <InterfacesForm interfaces={interfaces} add={false} routerId={routerId} />
    );
    const addInterface = {
      admin_state_up: true,
      cloud_network_id: 50,
      cloud_subnet_id: 50,
      cloud_tenant: { name: 'admin' },
      ext_management_system: { id: '8', name: 'Openstack Network Manager' },
      extra_attributes: {
        distributed: false,
        routes: [],
        high_availability: false,
        external_gateway_info: {
          enable_snat: true,
          external_fixed_ips: [
            {
              subnet_id: '1ca5cc3e-ffe1-44cf-94df-98a798489d06',
              ip_address: '10.9.60.151',
            },
          ],
          network_id: '6b3d0c3b-8b68-4c26-a493-5be44d160241',
        },
      },
    };
    miqAjaxButton('/network_router/add_interface/3?button=add', addInterface, {
      complete: false,
    });
    expect(spyMiqAjaxButton).toHaveBeenCalledWith(
      '/network_router/add_interface/3?button=add',
      addInterface,
      { complete: false }
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should remove interface', async() => {
    const { container } = renderWithRedux(
      <InterfacesForm
        interfaces={interfaces}
        removeinterfaces={removeinterfaces}
        routerId={routerId}
      />
    );
    const removeInterface = {
      admin_state_up: true,
      cloud_network_id: 50,
      cloud_subnet_id: 50,
      cloud_tenant: { name: 'admin' },
      ext_management_system: { id: '8', name: 'Openstack Network Manager' },
      extra_attributes: {
        distributed: false,
        routes: [],
        high_availability: false,
        external_gateway_info: {
          enable_snat: true,
          external_fixed_ips: [
            {
              subnet_id: '1ca5cc3e-ffe1-44cf-94df-98a798489d06',
              ip_address: '10.9.60.151',
            },
          ],
          network_id: '6b3d0c3b-8b68-4c26-a493-5be44d160241',
        },
      },
    };
    miqAjaxButton(
      '/network_router/add_interface/3?button=add',
      removeInterface,
      { complete: false }
    );
    expect(spyMiqAjaxButton).toHaveBeenCalledWith(
      '/network_router/add_interface/3?button=add',
      removeInterface,
      { complete: false }
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
