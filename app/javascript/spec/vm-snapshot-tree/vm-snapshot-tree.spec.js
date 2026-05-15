import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import VmSnapshotTree from '../../components/vm-snapshot-tree-select/snapshot-tree';

describe('VM Snaspthot Tree Select', () => {
  const url = `/${ManageIQ.controller}/snap_pressed/${encodeURIComponent(1)}`;
  const nodes = [
    {
      class: 'no-cursor',
      icon: 'pficon pficon-folder-close',
      key: 'root',
      selectable: false,
      text: 'test-root',
      tooltip: 'test-root',
      state: { expanded: true },
      nodes: [
        {
          icon: 'fa fa-camera',
          key: 'sn-1',
          selectable: true,
          text: 'test-child-1',
          tooltip: 'test-child-1',
          state: { expanded: true },
          nodes: [
            {
              icon: 'fa fa-camera',
              key: 'sn-1_sn-2',
              selectable: true,
              text: 'test-child-2',
              tooltip: 'test-child-2',
              state: { expanded: true },
            },
          ],
        },
      ],
    },
  ];

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render snapshot tree', async() => {
    const { container } = renderWithRedux(
      <VmSnapshotTree
        nodes={nodes}
        setSnapshot={() => {}}
        setCurrentSnapshot={() => {}}
      />
    );
    await waitFor(() => {
      expect(container.querySelector('.vm-snapshot-tree')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should submit select API call', async() => {
    fetchMock.postOnce(url, {});
    const { container } = renderWithRedux(
      <VmSnapshotTree
        nodes={nodes}
        setSnapshot={() => {}}
        setCurrentSnapshot={() => {}}
      />
    );
    await waitFor(() => {
      expect(container.querySelector('.vm-snapshot-tree')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
