import fetchMock from 'fetch-mock';
import { screen, waitFor } from '@testing-library/react';
import SubnetForm from '../../components/subnet-form';
import { renderWithRedux } from '../helpers/mountForm';

import '../helpers/miqSparkle';

describe('Subnet form component', () => {
  beforeAll(() => fetchMock.mockGlobal());

  beforeEach(() => {
    fetchMock.get(
      '/api/providers?expand=resources&attributes=id,name,supports_cloud_subnet_create&filter[]=supports_cloud_subnet_create=true',
      {
        resources: [{ id: 1, name: 'foo' }],
      }
    );
  });

  it('renders the adding form variant', async() => {
    const { container } = renderWithRedux(<SubnetForm />);
    // Wait for async loadOptions to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('renders the editing form variant', async() => {
    fetchMock.get('/api/cloud_subnets/1', { name: 'foo', ems_id: 1 });
    fetchMock.route(
      { method: 'OPTIONS', url: '/api/cloud_subnets/1' },
      { data: { form_schema: { fields: [] } } }
    );

    const { container } = renderWithRedux(<SubnetForm recordId="1" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
    expect(fetchMock.callHistory.called('/api/cloud_subnets/1')).toBe(true);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
