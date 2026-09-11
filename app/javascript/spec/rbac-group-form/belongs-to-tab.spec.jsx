import { render } from '@testing-library/react';
import BelongsToTab from '../../components/rbac-group-form/belongs-to-tab';

const bsTree = JSON.stringify([
  {
    key: 'root',
    text: 'My Cloud',
    icon: 'pficon pficon-folder-close',
    nodes: [
      {
        key: 'child-1',
        text: 'Region 1',
        icon: 'pficon pficon-container-node',
        nodes: [],
      },
      {
        key: 'child-2',
        text: 'Host 1',
        icon: 'pficon pficon-server',
        nodes: [],
      },
    ],
  },
]);

const noop = () => {};

describe('BelongsToTab', () => {
  it('renders "No items available." when the tree is empty', () => {
    const { container } = render(
      <BelongsToTab bsTree="[]" checked={[]} onCheckedChange={noop} />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the checkbox tree in edit mode', () => {
    const { container } = render(
      <BelongsToTab
        bsTree={bsTree}
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
        bsTree={bsTree}
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
        bsTree={bsTree}
        checked={[]}
        onCheckedChange={noop}
        readOnly={false}
        superAdminUser={false}
        limitedMessage="Access is limited to your current group."
      />
    );
    expect(container).toMatchSnapshot();
  });
});
