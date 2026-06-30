import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SimpleList from '../../components/chargeback-assignments-form/simple-list';
import { renderWithRedux } from '../helpers/mountForm';

describe('SimpleList component', () => {
  const mockRates = [
    { label: '<None>', value: 'nil' },
    { label: 'Rate 1', value: '1' },
    { label: 'Rate 2', value: '2' },
  ];

  const mockResources = [
    { id: '1', name: 'Resource 1' },
    { id: '2', name: 'Resource 2' },
  ];

  const mockAssignments = {};
  const mockOnRateChange = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state when no resources', () => {
    renderWithRedux(
      <SimpleList
        resources={[]}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    expect(screen.getByText(/no resources available/i)).toBeInTheDocument();
  });

  it('should render table with resources', () => {
    renderWithRedux(
      <SimpleList
        resources={mockResources}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    expect(screen.getByText('Resource 1')).toBeInTheDocument();
    expect(screen.getByText('Resource 2')).toBeInTheDocument();
  });

  it('should render rate dropdowns for each resource', () => {
    renderWithRedux(
      <SimpleList
        resources={mockResources}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    const dropdowns = screen.getAllByRole('combobox');
    expect(dropdowns).toHaveLength(2);
  });

  it('should call onRateChange when rate is selected', async() => {
    const user = userEvent.setup();
    renderWithRedux(
      <SimpleList
        resources={mockResources}
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

  it('should display selected rate in dropdown', () => {
    const assignmentsWithSelection = { 1: '1' };
    renderWithRedux(
      <SimpleList
        resources={mockResources}
        rates={mockRates}
        assignments={assignmentsWithSelection}
        onRateChange={mockOnRateChange}
      />
    );

    // The selected rate should be displayed
    expect(screen.getByText('Rate 1')).toBeInTheDocument();
  });

  it('should render table headers', () => {
    renderWithRedux(
      <SimpleList
        resources={mockResources}
        rates={mockRates}
        assignments={mockAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Rate')).toBeInTheDocument();
  });
});
