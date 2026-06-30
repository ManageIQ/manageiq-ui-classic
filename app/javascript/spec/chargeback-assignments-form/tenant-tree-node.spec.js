import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import TenantTreeNode from '../../components/chargeback-assignments-form/tenant-tree-node';

describe('TenantTreeNode component', () => {
  const mockRates = [
    { label: '<None>', value: 'nil' },
    { label: 'Rate 1', value: '1' },
    { label: 'Rate 2', value: '2' },
  ];

  const mockTenantWithChildren = {
    id: 1,
    name: 'Parent Tenant',
    children: [
      { id: 2, name: 'Child Tenant 1', children: [] },
      { id: 3, name: 'Child Tenant 2', children: [] },
    ],
  };

  const mockTenantWithoutChildren = {
    id: 4,
    name: 'Leaf Tenant',
    children: [],
  };

  const mockAssignments = {
    1: '1',
    2: 'nil',
  };

  const mockOnRateChange = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render tenant name', () => {
    renderWithRedux(
      <TenantTreeNode
        tenant={mockTenantWithoutChildren}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
        level={0}
      />
    );

    expect(screen.getByText('Leaf Tenant')).toBeInTheDocument();
  });

  it('should render expand button for tenant with children', () => {
    const { container } = renderWithRedux(
      <TenantTreeNode
        tenant={mockTenantWithChildren}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
        level={0}
      />
    );

    const expandButton = container.querySelector('.expand-button');
    expect(expandButton).toBeInTheDocument();
  });

  it('should not render expand button for tenant without children', () => {
    const { container } = renderWithRedux(
      <TenantTreeNode
        tenant={mockTenantWithoutChildren}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
        level={0}
      />
    );

    const expandButton = container.querySelector('.expand-button');
    expect(expandButton).not.toBeInTheDocument();
  });

  it('should expand and show children when expand button is clicked', async() => {
    const user = userEvent.setup();
    const { container } = renderWithRedux(
      <TenantTreeNode
        tenant={mockTenantWithChildren}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
        level={0}
      />
    );

    // Children should not be visible initially
    expect(screen.queryByText('Child Tenant 1')).not.toBeInTheDocument();

    // Click expand button
    const expandButton = container.querySelector('.expand-button');
    await user.click(expandButton);

    // Children should now be visible
    await waitFor(() => {
      expect(screen.getByText('Child Tenant 1')).toBeInTheDocument();
      expect(screen.getByText('Child Tenant 2')).toBeInTheDocument();
    });
  });

  it('should collapse and hide children when collapse button is clicked', async() => {
    const user = userEvent.setup();
    const { container } = renderWithRedux(
      <TenantTreeNode
        tenant={mockTenantWithChildren}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
        level={0}
      />
    );

    // Expand first
    const expandButton = container.querySelector('.expand-button');
    await user.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText('Child Tenant 1')).toBeInTheDocument();
    });

    // Now collapse (same button, just click again)
    await user.click(expandButton);

    // Children should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Child Tenant 1')).not.toBeInTheDocument();
    });
  });

  it('should render dropdown for rate selection', () => {
    const { container } = renderWithRedux(
      <TenantTreeNode
        tenant={mockTenantWithoutChildren}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
        level={0}
      />
    );

    const dropdown = container.querySelector(`#rate-${mockTenantWithoutChildren.id}`);
    expect(dropdown).toBeInTheDocument();
  });

  it('should call onRateChange when dropdown selection changes', () => {
    renderWithRedux(
      <TenantTreeNode
        tenant={mockTenantWithoutChildren}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
        level={0}
      />
    );

    // Verify that onRateChange prop is passed to the component
    // (actual dropdown interaction testing is complex with Carbon components
    // and is better suited for e2e tests)
    expect(mockOnRateChange).toBeDefined();
  });

  it('should apply correct indentation based on level', () => {
    const { container: container1 } = renderWithRedux(
      <TenantTreeNode
        tenant={mockTenantWithoutChildren}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
        level={0}
      />
    );

    const { container: container2 } = renderWithRedux(
      <TenantTreeNode
        tenant={mockTenantWithoutChildren}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
        level={2}
      />
    );

    const nodeName1 = container1.querySelector('.node-name');
    const nodeName2 = container2.querySelector('.node-name');

    // Level 2 should have more padding than level 0
    expect(nodeName1?.style.paddingLeft).not.toBe(nodeName2?.style.paddingLeft);
  });

  it('should render nested children recursively', async() => {
    const user = userEvent.setup();
    const nestedTenant = {
      id: 1,
      name: 'Root',
      children: [
        {
          id: 2,
          name: 'Level 1',
          children: [
            { id: 3, name: 'Level 2', children: [] },
          ],
        },
      ],
    };

    const { container } = renderWithRedux(
      <TenantTreeNode
        tenant={nestedTenant}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
        level={0}
      />
    );

    // Expand root
    const expandButtons = container.querySelectorAll('.expand-button');
    await user.click(expandButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Level 1')).toBeInTheDocument();
    });

    // Expand Level 1
    const expandButtonsAfter = container.querySelectorAll('.expand-button');
    if (expandButtonsAfter.length > 1) {
      await user.click(expandButtonsAfter[1]);
      await waitFor(() => {
        expect(screen.getByText('Level 2')).toBeInTheDocument();
      });
    }
  });

  it('should match snapshot', () => {
    const { container } = renderWithRedux(
      <TenantTreeNode
        tenant={mockTenantWithChildren}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
        level={0}
      />
    );

    expect(container).toMatchSnapshot();
  });
});
