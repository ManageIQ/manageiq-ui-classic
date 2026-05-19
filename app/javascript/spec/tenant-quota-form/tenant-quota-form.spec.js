import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import TenantQuotaForm from '../../components/tenant-quota-form/index';
import '../helpers/miqSparkle';

describe('Tenant Quota Form Component', () => {
  const quotaDefinitions = {
    data: {
      quota_definitions: {
        definition1: {
          description: 'Testing Testing 123',
          text_modifier: 'Count',
          unit: 'fixnum',
          value: null,
        },
        definition2: {
          description: 'This is a Test',
          text_modifier: 'GB',
          unit: 'bytes',
          value: null,
        },
      },
    },
  };

  const noQuotas = {
    resources: [],
  };

  const existingQuotas = {
    resources: [
      {
        href: 'http://localhost:3000/api/tenants/1/quotas/1',
        id: '1',
        tenant_id: '1',
        name: 'definition1',
        unit: 'fixnum',
        value: '3',
      },
    ],
  };

  beforeEach(() => {
    fetchMock.get('/api/tenants/1', { name: 'Test Tenant' });
    fetchMock.once('/api/tenants/1/quotas', quotaDefinitions);
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render the manage quotas form for a tenant no quotas defined', async() => {
    fetchMock.get('/api/tenants/1/quotas?expand=resources', noQuotas);

    const { container } = renderWithRedux(<TenantQuotaForm recordId="1" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(3);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render the manage quotas form for a tenant with 1 quota already defined', async() => {
    fetchMock.get('/api/tenants/1/quotas?expand=resources', existingQuotas);

    const { container } = renderWithRedux(<TenantQuotaForm recordId="1" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(3);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
