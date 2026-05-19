import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import CloudVolumeBackupForm from '../../components/cloud-volume-backup-form';

const cloudVolume = {
  recordId: '23',
  name: 'Cloud volume name',
  type: 'restore',
};

describe('Cloud Volume backup form component', () => {
  const mockResources = {
    resources: [
      { id: '1', name: 'Volume 1' },
      { id: '2', name: 'Volume 2' },
    ],
  };

  beforeEach(() => {
    fetchMock.mock(
      `/api/cloud_volumes?expand=resources&attributes=name,id`,
      mockResources
    );
  });
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render the restore cloud volume backup form', async() => {
    const { container } = renderWithRedux(
      <CloudVolumeBackupForm
        recordId={cloudVolume.recordId}
        name={cloudVolume.name}
        type={cloudVolume.type}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('when restoring cloud volume from backup', async() => {
    const { container } = renderWithRedux(
      <CloudVolumeBackupForm
        recordId={cloudVolume.recordId}
        name={cloudVolume.name}
        type={cloudVolume.type}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
