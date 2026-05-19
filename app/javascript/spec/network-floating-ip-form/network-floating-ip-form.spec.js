import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import NetworkFloatingIPsForm from '../../components/network-floatingIPs-form/index';

describe('Floating Ips Profile Form Component', () => {
  let initialProps;
  beforeEach(() => {
    initialProps = {
      ems: [
        {
          href: 'http://localhost:3000/api/providers/54',
          id: '54',
          name: 'RHV Network Manager',
          type: 'ManageIQ::Providers::Redhat::NetworkManager',
        },
      ],
    };
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render correctly', async() => {
    const { container } = renderWithRedux(
      <NetworkFloatingIPsForm {...initialProps} />
    );
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
