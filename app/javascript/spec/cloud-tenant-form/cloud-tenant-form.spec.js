import fetchMock from 'fetch-mock';
import { screen, waitFor } from '@testing-library/react';
import CloudTenantForm from '../../components/cloud-tenant-form';
import { renderWithRedux } from '../helpers/mountForm';

import '../helpers/miqAjaxButton';

describe('Cloud tenant form component', () => {
  beforeAll(() => fetchMock.mockGlobal());

  it('should render adding form variant', async() => {
    // eslint-disable-next-line max-len
    fetchMock.get('/api/providers?expand=resources&attributes=id,name,supports_cloud_tenants&filter[]=supports_cloud_tenants=true', { resources: [] });

    const { container } = renderWithRedux(<CloudTenantForm />);
    await waitFor(() => {
      // eslint-disable-next-line max-len
      expect(fetchMock.callHistory.called('/api/providers?expand=resources&attributes=id,name,supports_cloud_tenants&filter[]=supports_cloud_tenants=true')).toBe(true);
    });
    expect(container).toMatchSnapshot();
  });

  it('should render editing form variant', async() => {
    fetchMock.get('/api/cloud_tenants/1', { name: 'foo' });

    const { container } = renderWithRedux(<CloudTenantForm recordId="1" />);

    // Wait for the API call to complete
    await waitFor(() => {
      expect(fetchMock.callHistory.called('/api/cloud_tenants/1')).toBe(true);
    });

    // Wait for form to be fully rendered
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
