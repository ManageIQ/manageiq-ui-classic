import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import VmFloatingIPsForm from '../../components/vm-floating-ips/vm-floating-ips-form';
import { renderWithRedux } from '../helpers/mountForm';

describe('Associate / Disassociate form component', () => {
  const samplerecordId = '1';
  const sampleCloudTennantId = {
    cloud_tenant_id: '2',
  };
  const sampleFloatingIpChoice = {
    resources: [
      { address: '1.2.3.4', id: 1 },
      { address: '2.3.4.5', id: 2 },
      { address: '3.4.5.6', id: 3 },
      { address: '4.5.6.7', id: 4 },
      { address: '5.6.7.8', id: 5 },
    ],
  };

  beforeEach(() => {
    fetchMock.get(`/api/vms/${samplerecordId}`, sampleCloudTennantId);
    fetchMock.get(
      `/api/floating_ips?expand=resources&filter[]=cloud_tenant_id=${sampleCloudTennantId.cloud_tenant_id}`,
      sampleFloatingIpChoice
    );
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render form', async() => {
    const { container } = renderWithRedux(<VmFloatingIPsForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render associate form variant', async() => {
    const { container } = renderWithRedux(
      <VmFloatingIPsForm recordId={samplerecordId} isAssociate />
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render disassociate form variant', async() => {
    const { container } = renderWithRedux(
      <VmFloatingIPsForm recordId={samplerecordId} isAssociate={false} />
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  /**
   * Submit Logic
   */

  it('should submit Associate API call', async() => {
    const submitData = {
      action: 'associate',
      resource: {
        floating_ip: '1',
      },
    };
    fetchMock.postOnce(`/api/vms/${samplerecordId}`, submitData);

    const { container } = renderWithRedux(
      <VmFloatingIPsForm recordId={samplerecordId} isAssociate />
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should submit Disassociate API call', async() => {
    const submitData = {
      action: 'disassociate',
      resource: {
        floating_ip: '1',
      },
    };
    fetchMock.postOnce(`/api/vms/${samplerecordId}`, submitData);

    const { container } = renderWithRedux(
      <VmFloatingIPsForm recordId={samplerecordId} isAssociate={false} />
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
