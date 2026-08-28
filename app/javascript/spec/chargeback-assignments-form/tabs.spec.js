import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChargebackAssignmentsTabs from '../../components/chargeback-assignments-form/tabs';
import { renderWithRedux } from '../helpers/mountForm';

describe('ChargebackAssignmentsTabs component', () => {
  const mockRates = [
    {
      id: '1', description: 'Compute Rate', rate_type: 'Compute', assigned_to: [],
    },
    {
      id: '2', description: 'Storage Rate', rate_type: 'Storage', assigned_to: [],
    },
  ];

  beforeEach(() => {
    API.get = jest.fn((url) => {
      if (url.includes('/api/chargebacks')) {
        return Promise.resolve({ resources: mockRates });
      }
      return Promise.resolve({ resources: [] });
    });
    API.post = jest.fn().mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render both Compute and Storage tabs', () => {
    renderWithRedux(<ChargebackAssignmentsTabs />);
    expect(screen.getByRole('tab', { name: /compute/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /storage/i })).toBeInTheDocument();
  });

  it('should show Compute tab as selected by default', () => {
    renderWithRedux(<ChargebackAssignmentsTabs />);
    const computeTab = screen.getByRole('tab', { name: /compute/i });
    expect(computeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should show Storage tab as selected when initialTab=1', () => {
    renderWithRedux(<ChargebackAssignmentsTabs initialTab={1} />);
    const storageTab = screen.getByRole('tab', { name: /storage/i });
    expect(storageTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should switch to Storage tab on click', async() => {
    const user = userEvent.setup();
    renderWithRedux(<ChargebackAssignmentsTabs />);

    const storageTab = screen.getByRole('tab', { name: /storage/i });
    await user.click(storageTab);

    expect(storageTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should load chargeback data in both tab panels', async() => {
    renderWithRedux(<ChargebackAssignmentsTabs />);

    await waitFor(() => {
      expect(screen.getAllByText('Assign To')).toHaveLength(2);
    });
  });

  it('should match snapshot', async() => {
    const { container } = renderWithRedux(<ChargebackAssignmentsTabs />);

    await waitFor(() => {
      expect(screen.getAllByText('Assign To')).toHaveLength(2);
    });

    expect(container).toMatchSnapshot();
  });
});
