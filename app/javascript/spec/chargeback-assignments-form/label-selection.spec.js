import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LabelSelection from '../../components/chargeback-assignments-form/label-selection';
import { renderWithRedux } from '../helpers/mountForm';

describe('LabelSelection component', () => {
  const mockRates = [
    { label: '<None>', value: 'nil' },
    { label: 'Rate 1', value: '1' },
    { label: 'Rate 2', value: '2' },
  ];

  const mockContainerImages = {
    resources: [
      {
        id: '100',
        name: 'image1',
        custom_attributes: [
          {
            id: '1',
            name: 'com.redhat.component',
            value: 'component1',
            section: 'docker_labels',
          },
          {
            id: '2',
            name: 'version',
            value: '1.0',
            section: 'docker_labels',
          },
        ],
      },
      {
        id: '101',
        name: 'image2',
        custom_attributes: [
          {
            id: '3',
            name: 'com.redhat.component',
            value: 'component2',
            section: 'docker_labels',
          },
        ],
      },
    ],
  };

  const mockAssignments = {};
  const mockSavedAssignments = [];
  const mockOnRateChange = jest.fn();

  beforeEach(() => {
    API.get = jest.fn().mockResolvedValue(mockContainerImages);
    window.add_flash = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    renderWithRedux(
      <LabelSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    expect(screen.getByText(/loading image labels/i)).toBeInTheDocument();
  });

  it('should render label key dropdown after loading', async() => {
    renderWithRedux(
      <LabelSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Image Labels')).toBeInTheDocument();
    });
  });

  it('should display label keys in dropdown', async() => {
    const user = userEvent.setup();
    renderWithRedux(
      <LabelSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Image Labels')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox', { name: /image labels/i });
    await user.click(dropdown);

    await waitFor(() => {
      expect(screen.getByText('com.redhat.component')).toBeInTheDocument();
      expect(screen.getByText('version')).toBeInTheDocument();
    });
  });

  it('should show label values when label key is selected', async() => {
    const user = userEvent.setup();
    renderWithRedux(
      <LabelSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Image Labels')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox', { name: /image labels/i });
    await user.click(dropdown);

    const componentOption = screen.getByText('com.redhat.component');
    await user.click(componentOption);

    await waitFor(() => {
      expect(screen.getByText('component1')).toBeInTheDocument();
      expect(screen.getByText('component2')).toBeInTheDocument();
    });
  });

  it('should render rate dropdowns for label values', async() => {
    const user = userEvent.setup();
    renderWithRedux(
      <LabelSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Image Labels')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox', { name: /image labels/i });
    await user.click(dropdown);
    const componentOption = screen.getByText('com.redhat.component');
    await user.click(componentOption);

    await waitFor(() => {
      const rateDropdowns = screen.getAllByRole('combobox');
      expect(rateDropdowns.length).toBeGreaterThan(1);
    });
  });

  it('should call onRateChange with container image ID when rate is selected', async() => {
    const user = userEvent.setup();
    renderWithRedux(
      <LabelSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Image Labels')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox', { name: /image labels/i });
    await user.click(dropdown);
    const componentOption = screen.getByText('com.redhat.component');
    await user.click(componentOption);

    await waitFor(() => {
      const rateDropdowns = screen.getAllByRole('combobox');
      expect(rateDropdowns.length).toBeGreaterThan(1);
    });

    const rateDropdowns = screen.getAllByRole('combobox');
    await user.click(rateDropdowns[1]); // First is label key dropdown, second is rate dropdown

    const rate1Option = screen.getByText('Rate 1');
    await user.click(rate1Option);

    expect(mockOnRateChange).toHaveBeenCalledWith('1', '1', '100');
  });

  it('should display saved assignments', async() => {
    const savedAssignments = [
      {
        type: 'label',
        assignmentType: 'container_image-labels',
        labelId: '1',
        labelHref: '/api/container_images/100/custom_attributes/1',
        rateId: '1',
        rateDescription: 'Rate 1',
      },
    ];

    renderWithRedux(
      <LabelSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={savedAssignments}
        onRateChange={mockOnRateChange}
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
      <LabelSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    await waitFor(() => {
      expect(window.add_flash).toHaveBeenCalledWith('API Error', 'error');
    });
  });

  it('should show empty state when no label values available', async() => {
    const user = userEvent.setup();
    const emptyImages = { resources: [] };
    API.get = jest.fn()
      .mockResolvedValueOnce(mockContainerImages) // First call for label keys
      .mockResolvedValueOnce(emptyImages); // Second call for label values

    renderWithRedux(
      <LabelSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Image Labels')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox', { name: /image labels/i });
    await user.click(dropdown);
    const componentOption = screen.getByText('com.redhat.component');
    await user.click(componentOption);

    await waitFor(() => {
      expect(screen.getByText(/no label values available/i)).toBeInTheDocument();
    });
  });

  it('should prioritize default labels', async() => {
    const user = userEvent.setup();
    renderWithRedux(
      <LabelSelection
        rates={mockRates}
        assignments={mockAssignments}
        savedAssignments={mockSavedAssignments}
        onRateChange={mockOnRateChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Image Labels')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox', { name: /image labels/i });
    await user.click(dropdown);

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const optionTexts = options.map((opt) => opt.textContent);

      // com.redhat.component should appear before version (default label first)
      const componentIndex = optionTexts.indexOf('com.redhat.component');
      const versionIndex = optionTexts.indexOf('version');

      expect(componentIndex).toBeLessThan(versionIndex);
    });
  });
});
