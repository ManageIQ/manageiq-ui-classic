import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor } from '@testing-library/react';
import CloudTenantForm from '../../components/cloud-tenant-form';
import { renderWithRedux } from '../helpers/mountForm';

import '../helpers/miqAjaxButton';

describe('Cloud tenant form component', () => {
  let submitSpy;
  beforeEach(() => {
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });

  it('should render adding form variant', () => {
    const { container } = renderWithRedux(<CloudTenantForm />);
    expect(container).toMatchSnapshot();
  });

  it('should render editing form variant', async() => {
    fetchMock.get('/api/cloud_tenants/1', { name: 'foo' });

    const { container } = renderWithRedux(<CloudTenantForm recordId="1" />);

    // Wait for the API call to complete
    await waitFor(() => {
      expect(fetchMock.called('/api/cloud_tenants/1')).toBe(true);
    });

    // Wait for form to be fully rendered
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
