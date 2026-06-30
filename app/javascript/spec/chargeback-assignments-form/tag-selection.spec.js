import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagSelection from '../../components/chargeback-assignments-form/tag-selection';
import { renderWithRedux } from '../helpers/mountForm';

describe('TagSelection component', () => {
  const mockRates = [
    { label: '<None>', value: 'nil' },
    { label: 'Rate 1', value: '1' },
    { label: 'Rate 2', value: '2' },
  ];

  const mockCategories = {
    resources: [
      {
        id: '1',
        name: 'location',
        description: 'Location',
        show: true,
        tags: [
          { id: '10', name: '/managed/location/ny', href: '/api/tags/10' },
          { id: '11', name: '/managed/location/ca', href: '/api/tags/11' },
        ],
      },
      {
        id: '2',
        name: 'environment',
        description: 'Environment',
        show: true,
        tags: [
          { id: '20', name: '/managed/environment/prod', href: '/api/tags/20' },
          { id: '21', name: '/managed/environment/dev', href: '/api/tags/21' },
        ],
      },
    ],
  };

  const mockAssignments = {};
  const mockSavedAssignments = [];
  const mockOnRateChange = jest.fn();

  beforeEach(() => {
    API.get = jest.fn().mockResolvedValue(mockCategories);
    window.add_flash = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    renderWithRedux(
      <TagSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
        assignmentType="vm-tags"
      />
    );

    expect(screen.getByText(/loading tag categories/i)).toBeInTheDocument();
  });

  it('should render category dropdown after loading', async() => {
    renderWithRedux(
      <TagSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
        assignmentType="vm-tags"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tag Category')).toBeInTheDocument();
    });
  });

  it('should display categories in dropdown', async() => {
    const user = userEvent.setup();
    renderWithRedux(
      <TagSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
        assignmentType="vm-tags"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tag Category')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox', { name: /tag category/i });
    await user.click(dropdown);

    await waitFor(() => {
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Environment')).toBeInTheDocument();
    });
  });

  it('should show tags when category is selected', async() => {
    const user = userEvent.setup();
    renderWithRedux(
      <TagSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
        assignmentType="vm-tags"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tag Category')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox', { name: /tag category/i });
    await user.click(dropdown);

    const locationOption = screen.getByText('Location');
    await user.click(locationOption);

    await waitFor(() => {
      expect(screen.getByText('ny')).toBeInTheDocument();
      expect(screen.getByText('ca')).toBeInTheDocument();
    });
  });

  it('should render rate dropdowns for tags', async() => {
    const user = userEvent.setup();
    renderWithRedux(
      <TagSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
        assignmentType="vm-tags"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tag Category')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox', { name: /tag category/i });
    await user.click(dropdown);
    const locationOption = screen.getByText('Location');
    await user.click(locationOption);

    await waitFor(() => {
      const rateDropdowns = screen.getAllByRole('combobox');
      expect(rateDropdowns.length).toBeGreaterThan(1);
    });
  });

  it('should call onRateChange when rate is selected', async() => {
    const user = userEvent.setup();
    renderWithRedux(
      <TagSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
        assignmentType="vm-tags"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tag Category')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox', { name: /tag category/i });
    await user.click(dropdown);
    const locationOption = screen.getByText('Location');
    await user.click(locationOption);

    await waitFor(() => {
      expect(screen.getByText('ny')).toBeInTheDocument();
      expect(screen.getByText('ca')).toBeInTheDocument();
    });

    // Get all comboboxes - first is category, rest are rate dropdowns for each tag
    const rateDropdowns = screen.getAllByRole('combobox');
    // Click the first rate dropdown (index 1, after category dropdown at index 0)
    await user.click(rateDropdowns[1]);

    const rate1Option = screen.getByText('Rate 1');
    await user.click(rate1Option);

    // Tags are sorted alphabetically, so 'ca' (id 11) comes before 'ny' (id 10)
    expect(mockOnRateChange).toHaveBeenCalledWith('11', '1');
  });

  it('should display saved assignments', async() => {
    const savedAssignments = [
      {
        type: 'tag',
        assignmentType: 'vm-tags',
        tagId: '10',
        tagHref: '/api/tags/10',
        tagName: 'ny',
        tagDescription: 'New York',
        tagCategory: 'location',
        rateId: '1',
        rateDescription: 'Rate 1',
      },
    ];

    renderWithRedux(
      <TagSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={savedAssignments}
        onRateChange={mockOnRateChange}
        assignmentType="vm-tags"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/saved items/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async() => {
    API.get = jest.fn().mockRejectedValue({
      data: { error: { message: 'API Error' } },
    });

    renderWithRedux(
      <TagSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
        assignmentType="vm-tags"
      />
    );

    await waitFor(() => {
      expect(window.add_flash).toHaveBeenCalledWith('API Error', 'error');
    });
  });

  it('should reset state when assignment type changes', async() => {
    const { rerender } = renderWithRedux(
      <TagSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
        assignmentType="vm-tags"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tag Category')).toBeInTheDocument();
    });

    // Change assignment type
    rerender(
      <TagSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
        assignmentType="storage-tags"
      />
    );

    // State should be reset
    await waitFor(() => {
      expect(screen.getByText('Tag Category')).toBeInTheDocument();
    });
  });
});
