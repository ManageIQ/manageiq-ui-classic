import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';

import { act } from 'react-dom/test-utils';
import '../helpers/miqSparkle';
import { mount } from '../helpers/mountForm';
import TenantQuotaForm from '../../components/tenant-quota-form/index';

describe('Tenant Quota Form Component', () => {
  const api = {
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

  const api2 = {
    resources: [],
  };

  const api3 = {
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

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render the manage quotas form for a tenant no quotas defined', async(done) => {
    fetchMock.get('/api/tenants/1', { name: 'Test Tenant' });
    fetchMock.once('/api/tenants/1/quotas', api);
    fetchMock.get('/api/tenants/1/quotas?expand=resources', api2);
    let wrapper;

    await act(async() => {
      wrapper = mount(<TenantQuotaForm recordId="1" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(3);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render the manage quotas form for a tenant with 1 quota already defined', async(done) => {
    fetchMock.get('/api/tenants/1', { name: 'Test Tenant' });
    fetchMock.once('/api/tenants/1/quotas', api);
    fetchMock.get('/api/tenants/1/quotas?expand=resources', api3);
    let wrapper;

    await act(async() => {
      wrapper = mount(<TenantQuotaForm recordId="1" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(3);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
