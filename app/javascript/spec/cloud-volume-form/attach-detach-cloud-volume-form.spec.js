import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor } from '@testing-library/react';
import AttachDetachCloudVolumeForm from '../../components/cloud-volume-form/attach-detach-cloud-volume-form';
import { renderWithRedux } from '../helpers/mountForm';

describe('Attach / Detach form component', () => {
  const sampleVmChoice = [
    ['server1', 1],
    ['server2', 2],
    ['server3', 3],
    ['server4', 4],
    ['server5', 5],
  ];

  const response = {
    data: {
      form_schema: {
        fields: [
          {
            component: 'text-field',
            name: 'device_mountpoint',
            id: 'device_mountpoint',
            label: _('Device Mountpoint'),
            isRequired: true,
            validate: [{ type: 'required' }],
          },
        ],
      },
    },
  };

  beforeEach(() => {
    fetchMock.once('/api/cloud_volumes/1?option_action=attach', response);
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render form', async() => {
    const { container } = renderWithRedux(<AttachDetachCloudVolumeForm />);
    expect(container).toMatchSnapshot();
  });

  /** Steps to reach page tested:
    1. Storage > Volume
    2. Configuration > Attach / Detach to an Instance
  */
  it('should render Attach Selected Cloud Volume to an Instance form', async() => {
    const { container } = renderWithRedux(
      <AttachDetachCloudVolumeForm
        recordId="1"
        dropdownChoices={sampleVmChoice}
        dropdownLabel="Instance"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /attach/i })
      ).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render Detach Selected Cloud Volume from an Instance form', async() => {
    const { container } = renderWithRedux(
      <AttachDetachCloudVolumeForm
        isAttach={false}
        recordId="1"
        dropdownChoices={sampleVmChoice}
        dropdownLabel="Instance"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /detach/i })
      ).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  /**  Steps to reach page tested:
    1. Compute > Cloud > Instances
    2. Select an Instance that allows for attach/detach (Openstack, IBM Cloud, Amazon)
    3. Configuration > Attach / Detach a Cloud Volume from this Instance
  */
  it('should render Attach Cloud Volume to the Selected Instance form', async() => {
    const { container } = renderWithRedux(
      <AttachDetachCloudVolumeForm
        recordId="1"
        dropdownChoices={sampleVmChoice}
        dropdownLabel="Volume"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /attach/i })
      ).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render Detach Cloud Volume from the Selected Instance form', async() => {
    const { container } = renderWithRedux(
      <AttachDetachCloudVolumeForm
        isAttach={false}
        recordId="1"
        dropdownChoices={sampleVmChoice}
        dropdownLabel="Volume"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /detach/i })
      ).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  /** Submit Logic */
  it('should submit Attach API call', async() => {
    const submitData = {
      action: 'attach',
      resource: {
        vm_id: '1',
        device: '',
      },
    };
    fetchMock.postOnce('/api/cloud_volumes/1', submitData);

    const { container } = renderWithRedux(
      <AttachDetachCloudVolumeForm
        recordId="1"
        dropdownChoices={sampleVmChoice}
        dropdownLabel="Instance"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /attach/i })
      ).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should submit Detach API call', async() => {
    const submitData = {
      action: 'detach',
      resource: {
        vm_id: '1',
        device: '',
      },
    };
    fetchMock.postOnce('/api/cloud_volumes/1', submitData);

    const { container } = renderWithRedux(
      <AttachDetachCloudVolumeForm
        isAttach={false}
        recordId="1"
        dropdownChoices={sampleVmChoice}
        dropdownLabel="Volume"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /detach/i })
      ).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
