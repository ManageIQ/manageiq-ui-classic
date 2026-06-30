import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TenantTree from '../../components/chargeback-assignments-form/tenant-tree';
import { renderWithRedux } from '../helpers/mountForm';

describe('TenantTree component', () => {
  const mockRates = [
    { label: '<None>', value: 'nil' },
    { label: 'Rate 1', value: '1' },
    { label: 'Rate 2', value: '2' },
  ];

  const mockTenants = [
    {
      id: '1',
      name: 'Parent Tenant',
      children: [
        { id: '2', name: 'Child Tenant 1', children: [] },
        { id: '3', name: 'Child Tenant 2', children: [] },
      ],
    },
  ];

  const mockAssignments = {};
  const mockOnRateChange = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state when no tenants', () => {
    renderWithRedux(
      <TenantTree
        tenants={[]}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    expect(screen.getByText(/no tenants available/i)).toBeInTheDocument();
  });

  it('should render tenant tree with parent tenant', () => {
    renderWithRedux(
      <TenantTree
        tenants={mockTenants}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    expect(screen.getByText('Parent Tenant')).toBeInTheDocument();
  });

  it('should show expand button for tenants with children', () => {
    renderWithRedux(
      <TenantTree
        tenants={mockTenants}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    const expandButton = screen.getByLabelText(/expand/i);
    expect(expandButton).toBeInTheDocument();
  });

  it('should expand and show child tenants when expand button is clicked', async() => {
    const user = userEvent.setup();
    renderWithRedux(
      <TenantTree
        tenants={mockTenants}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    const expandButton = screen.getByLabelText(/expand/i);
    await user.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText('Child Tenant 1')).toBeInTheDocument();
      expect(screen.getByText('Child Tenant 2')).toBeInTheDocument();
    });
  });

  it('should render rate dropdowns for each tenant', () => {
    renderWithRedux(
      <TenantTree
        tenants={mockTenants}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    const dropdowns = screen.getAllByRole('combobox');
    expect(dropdowns.length).toBeGreaterThan(0);
  });

  it('should call onRateChange when rate is selected', async() => {
    const user = userEvent.setup();
    renderWithRedux(
      <TenantTree
        tenants={mockTenants}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    const dropdowns = screen.getAllByRole('combobox');
    await user.click(dropdowns[0]);

    const rate1Option = screen.getByText('Rate 1');
    await user.click(rate1Option);

    expect(mockOnRateChange).toHaveBeenCalledWith('1', '1');
  });

  it('should render table headers', () => {
    renderWithRedux(
      <TenantTree
        tenants={mockTenants}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Rate')).toBeInTheDocument();
  });

  it('should indent child tenants', async() => {
    const user = userEvent.setup();
    renderWithRedux(
      <TenantTree
        tenants={mockTenants}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    // Expand to show children
    const expandButton = screen.getByLabelText(/expand/i);
    await user.click(expandButton);

    await waitFor(() => {
      const childTenant = screen.getByText('Child Tenant 1');
      const parentCell = childTenant.closest('td');
      expect(parentCell).toHaveStyle({ paddingLeft: expect.stringContaining('rem') });
    });
  });
});
