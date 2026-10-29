import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import BelongsToTab from '../../components/rbac-group-form/belongs-to-tab';

const noop = () => {};

// A simple flat tree — one root with two leaf children, no hideCheckbox.
const flatTree = JSON.stringify([
  {
    key: 'root',
    text: 'My Cloud',
    icon: 'pficon pficon-folder-close',
    nodes: [
      {
        key: 'child-1', text: 'Region 1', icon: 'pficon pficon-container-node', nodes: [],
      },
      {
        key: 'child-2', text: 'Host 1', icon: 'pficon pficon-server', nodes: [],
      },
    ],
  },
]);

// Mirrors the HAC tree shape: a cluster whose only children are hidden-checkbox hosts.
// The cluster itself should become a selectable leaf.
const hacTree = JSON.stringify([
  {
    key: 'e-1',
    text: 'Seed Provider',
    nodes: [
      {
        key: 'dc-1',
        text: 'Seed DC 1',
        nodes: [
          {
            key: 'cluster-a',
            text: 'Cluster A',
            nodes: [
              {
                key: 'host-1', text: 'host-a1.example.com', hideCheckbox: true, nodes: [],
              },
              {
                key: 'host-2', text: 'host-a2.example.com', hideCheckbox: true, nodes: [],
              },
            ],
          },
          { key: 'standalone', text: 'standalone.example.com', nodes: [] },
        ],
      },
    ],
  },
]);

// Mirrors the VAT tree shape: only vm_folder nodes have a checkbox; everything
// else (provider, datacenter) has hideCheckbox.
const vatTree = JSON.stringify([
  {
    key: 'e-1',
    text: 'Seed Provider',
    hideCheckbox: true,
    nodes: [
      {
        key: 'dc-1',
        text: 'Seed DC 1',
        hideCheckbox: true,
        nodes: [
          { key: 'web-tier', text: 'Web Tier', nodes: [] }, // vm_folder — no hideCheckbox
        ],
      },
    ],
  },
]);

describe('BelongsToTab', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('renders "No items available." when the tree is empty', () => {
    const { container } = render(
      <BelongsToTab bsTree="[]" checked={[]} onCheckedChange={noop} />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the checkbox tree in edit mode', () => {
    const { container } = render(
      <BelongsToTab
        bsTree={flatTree}
        checked={['child-1']}
        onCheckedChange={noop}
        readOnly={false}
        superAdminUser
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the checkbox tree in read-only mode', () => {
    const { container } = render(
      <BelongsToTab
        bsTree={flatTree}
        checked={['child-1']}
        onCheckedChange={noop}
        readOnly
        superAdminUser
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the limited-access message for non-super-admin users', () => {
    const { container } = render(
      <BelongsToTab
        bsTree={flatTree}
        checked={[]}
        onCheckedChange={noop}
        readOnly={false}
        superAdminUser={false}
        limitedMessage="Access is limited to your current group."
      />
    );
    expect(container).toMatchSnapshot();
  });

  describe('Select All / Deselect All', () => {
    it('Select All only calls onCheckedChange with leaf node values', async() => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <BelongsToTab bsTree={flatTree} checked={[]} onCheckedChange={onChange} />
      );

      await user.click(screen.getAllByRole('button', { name: /select all/i })[0]);

      // root has children so it is not a leaf — only child-1 and child-2 are collected
      expect(onChange).toHaveBeenCalledWith(expect.not.arrayContaining(['root']));
      expect(onChange).toHaveBeenCalledWith(expect.arrayContaining(['child-1', 'child-2']));
    });

    it('Deselect All calls onCheckedChange with an empty array', async() => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <BelongsToTab bsTree={flatTree} checked={['child-1', 'child-2']} onCheckedChange={onChange} />
      );

      await user.click(screen.getAllByRole('button', { name: /deselect all/i })[0]);

      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('hideCheckbox handling', () => {
    it('clusters whose only children are hidden-checkbox hosts are rendered as selectable leaves (HAC tree)', async() => {
      const user = userEvent.setup();
      render(
        <BelongsToTab bsTree={hacTree} checked={[]} onCheckedChange={noop} />
      );

      // Expand the provider node to reveal DC and cluster
      await user.click(screen.getAllByRole('button')[0]);

      // Cluster A is visible after expanding
      expect(screen.getByText('Cluster A')).toBeInTheDocument();
      // The hidden hosts are not rendered at all
      expect(screen.queryByText('host-a1.example.com')).not.toBeInTheDocument();
      expect(screen.queryByText('host-a2.example.com')).not.toBeInTheDocument();
    });

    it('Select All on a HAC tree does not include hidden-checkbox host keys', async() => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <BelongsToTab bsTree={hacTree} checked={[]} onCheckedChange={onChange} />
      );

      await user.click(screen.getAllByRole('button', { name: /select all/i })[0]);

      const called = onChange.mock.calls[0][0];
      expect(called).not.toContain('host-1');
      expect(called).not.toContain('host-2');
      expect(called).toContain('cluster-a');
      expect(called).toContain('standalone');
    });

    it('nodes with hideCheckbox are still visible for navigation but have no checkbox (VAT tree)', async() => {
      const user = userEvent.setup();
      render(
        <BelongsToTab bsTree={vatTree} checked={[]} onCheckedChange={noop} />
      );

      // Expand the provider to reveal DC and Web Tier
      await user.click(screen.getAllByRole('button')[0]);

      expect(screen.getByText('Seed Provider')).toBeInTheDocument();
      expect(screen.getByText('Web Tier')).toBeInTheDocument();
    });

    it('Select All on a VAT tree only includes the vm_folder leaf', async() => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <BelongsToTab bsTree={vatTree} checked={[]} onCheckedChange={onChange} />
      );

      await user.click(screen.getAllByRole('button', { name: /select all/i })[0]);

      const called = onChange.mock.calls[0][0];
      expect(called).toEqual(['web-tier']);
    });
  });
});
