import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChargebackAssignmentsForm from '../../components/chargeback-assignments-form';
import { renderWithRedux } from '../helpers/mountForm';

describe('ChargebackAssignmentsForm component', () => {
  const mockRates = [
    {
      id: '1', description: 'Rate 1', rate_type: 'Compute', assigned_to: [],
    },
    {
      id: '2', description: 'Rate 2', rate_type: 'Compute', assigned_to: [],
    },
  ];

  const mockEnterprises = {
    resources: [{ id: '1', name: 'Enterprise' }],
  };

  const mockProviders = {
    resources: [
      { id: '1', name: 'Provider 1' },
      { id: '2', name: 'Provider 2' },
    ],
  };

  beforeEach(() => {
    // Mock API calls
    API.get = jest.fn((url) => {
      if (url.includes('/api/enterprises')) {
        return Promise.resolve(mockEnterprises);
      }
      if (url.includes('/api/chargebacks')) {
        return Promise.resolve({ resources: mockRates });
      }
      if (url.includes('/api/providers')) {
        return Promise.resolve(mockProviders);
      }
      return Promise.resolve({ resources: [] });
    });

    API.post = jest.fn().mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    renderWithRedux(<ChargebackAssignmentsForm rateType="Compute" />);
    expect(screen.getByText(/loading chargeback data/i)).toBeInTheDocument();
  });

  it('should render form after loading', async() => {
    renderWithRedux(<ChargebackAssignmentsForm rateType="Compute" />);

    await waitFor(() => {
      expect(screen.getByText('Assign To')).toBeInTheDocument();
    });
  });

  it('should render correct assignment types for Compute rate type', async() => {
    const user = userEvent.setup();
    renderWithRedux(<ChargebackAssignmentsForm rateType="Compute" />);

    await waitFor(() => {
      expect(screen.getByText('Assign To')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox', { name: /assign to/i });
    await user.click(dropdown);

    await waitFor(() => {
      expect(screen.getByText(/the enterprise/i)).toBeInTheDocument();
      expect(screen.getByText(/selected providers/i)).toBeInTheDocument();
      expect(screen.getByText(/selected clusters/i)).toBeInTheDocument();
      expect(screen.getByText(/tagged vms and instances/i)).toBeInTheDocument();
    });
  });

  it('should render correct assignment types for Storage rate type', async() => {
    const user = userEvent.setup();
    const mockStorageRates = [
      {
        id: '1', description: 'Storage Rate 1', rate_type: 'Storage', assigned_to: [],
      },
    ];

    API.get = jest.fn((url) => {
      if (url.includes('/api/enterprises')) {
        return Promise.resolve(mockEnterprises);
      }
      if (url.includes('/api/chargebacks')) {
        return Promise.resolve({ resources: mockStorageRates });
      }
      return Promise.resolve({ resources: [] });
    });

    renderWithRedux(<ChargebackAssignmentsForm rateType="Storage" />);

    await waitFor(() => {
      expect(screen.getByText('Assign To')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox', { name: /assign to/i });
    await user.click(dropdown);

    await waitFor(() => {
      expect(screen.getByText(/the enterprise/i)).toBeInTheDocument();
      expect(screen.getByText(/selected datastores/i)).toBeInTheDocument();
      expect(screen.getByText(/tagged datastores/i)).toBeInTheDocument();
    });
  });

  it('should show Save and Cancel buttons when assignment type is selected', async() => {
    const user = userEvent.setup();
    renderWithRedux(<ChargebackAssignmentsForm rateType="Compute" />);

    await waitFor(() => {
      expect(screen.getByText('Assign To')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox', { name: /assign to/i });
    await user.click(dropdown);

    const enterpriseOption = screen.getByText(/the enterprise/i);
    await user.click(enterpriseOption);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  it('should call API on form submit', async() => {
    const user = userEvent.setup();
    renderWithRedux(<ChargebackAssignmentsForm rateType="Compute" />);

    await waitFor(() => {
      expect(screen.getByText('Assign To')).toBeInTheDocument();
    });

    // Select enterprise assignment type
    const dropdown = screen.getByRole('combobox', { name: /assign to/i });
    await user.click(dropdown);
    const enterpriseOption = screen.getByText(/the enterprise/i);
    await user.click(enterpriseOption);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    // Select a rate
    await waitFor(() => {
      const rateDropdowns = screen.getAllByRole('combobox');
      expect(rateDropdowns.length).toBeGreaterThan(1);
    });

    const rateDropdowns = screen.getAllByRole('combobox');
    await user.click(rateDropdowns[1]); // First is assign to, second is rate

    await waitFor(() => {
      const rate1Option = screen.getByText('Rate 1');
      expect(rate1Option).toBeInTheDocument();
    });

    const rate1Option = screen.getByText('Rate 1');
    await user.click(rate1Option);

    // Submit form
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        '/api/chargebacks',
        expect.objectContaining({
          action: 'assign',
          assignments: expect.any(Array),
        })
      );
    });
  });

  it('should clear assignments on cancel', async() => {
    const user = userEvent.setup();
    renderWithRedux(<ChargebackAssignmentsForm rateType="Compute" />);

    await waitFor(() => {
      expect(screen.getByText('Assign To')).toBeInTheDocument();
    });

    // Select assignment type to show buttons
    const dropdown = screen.getByRole('combobox', { name: /assign to/i });
    await user.click(dropdown);
    const enterpriseOption = screen.getByText(/the enterprise/i);
    await user.click(enterpriseOption);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // After cancel, assignments are cleared — buttons are hidden since assignmentType persists
    // but the form is back to a clean state (no flash, no redirect)
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async() => {
    API.get = jest.fn().mockRejectedValue({
      data: { error: { message: 'API Error' } },
    });

    renderWithRedux(<ChargebackAssignmentsForm rateType="Compute" />);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });
});
