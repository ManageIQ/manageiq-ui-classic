import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import NetworkFloatingIPsForm from '../../components/network-floatingIPs-form/index';

describe('Floating Ips Profile Form Component', () => {
  // eslint-disable-next-line max-len
  const providersUrl = '/api/providers?expand=resources&attributes=id,name,supports_create_floating_ip&filter[]=supports_create_floating_ip=true&attributes=id,name,type';
  const providersMock = {
    resources: [
      {
        href: 'http://localhost:3000/api/providers/54',
        id: '54',
        name: 'RHV Network Manager',
        type: 'ManageIQ::Providers::Redhat::NetworkManager',
      },
    ],
  };

  beforeAll(() => fetchMock.mockGlobal());

  it('should render correctly', async() => {
    fetchMock.get(providersUrl, providersMock);
    const { container } = renderWithRedux(<NetworkFloatingIPsForm />);
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
