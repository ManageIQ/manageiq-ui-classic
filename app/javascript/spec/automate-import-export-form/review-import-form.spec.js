import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ReviewImportForm from '../../components/automate-import-export-form/review-import-form';
import { http } from '../../http_api';

jest.mock('../../http_api');
jest.mock('../../components/tree-view/checkbox_tree', () => {
  const MockCheckboxTree = ({ onChange }) => (
    <div data-testid="checkbox-tree">
      <input
        type="checkbox"
        data-testid="namespace-checkbox"
        onChange={(e) => onChange && onChange(e.target.checked ? ['ns1', 'ns2'] : [])}
      />
      <span>Mock Checkbox Tree</span>
    </div>
  );
  MockCheckboxTree.displayName = 'CheckboxTreeComponent';
  return MockCheckboxTree;
});

describe('ReviewImportForm component', () => {
  const mockImportData = [
    {
      text: 'TestDomain',
      nodes: [
        { key: 'ns1', text: 'Namespace1' },
        { key: 'ns2', text: 'Namespace2' },
      ],
    },
  ];

  const mockDomainsResponse = {
    resources: [
      { name: 'ExistingDomain1', enabled: true },
      { name: 'ExistingDomain2', enabled: true },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.miqSparkleOn = jest.fn();
    window.miqSparkleOff = jest.fn();
    window.miqFlashLater = jest.fn();
    window.API = {
      get: jest.fn(),
    };
  });

  it('should show loading indicator initially', () => {
    http.get.mockReturnValue(new Promise(() => {}));
    window.API.get.mockReturnValue(new Promise(() => {}));

    renderWithRedux(
      <ReviewImportForm
        importFileUploadId="test-123"
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText(/Loading import data.../i)).toBeInTheDocument();
  });

  it('should fetch import data and domains on mount', async() => {
    http.get.mockResolvedValueOnce(JSON.stringify(mockImportData));
    window.API.get.mockResolvedValueOnce(mockDomainsResponse);

    renderWithRedux(
      <ReviewImportForm
        importFileUploadId="test-123"
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(http.get).toHaveBeenCalledWith('/miq_ae_tools/automate_json?import_file_upload_id=test-123');
      expect(window.API.get).toHaveBeenCalledWith(
        '/api/automate_domains?expand=resources&attributes=name,enabled,source&filter[]=enabled=true&filter[]=source=user'
      );
    });
  });

  it('should render form after data loads', async() => {
    http.get.mockResolvedValueOnce(JSON.stringify(mockImportData));
    window.API.get.mockResolvedValueOnce(mockDomainsResponse);

    renderWithRedux(
      <ReviewImportForm
        importFileUploadId="test-123"
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Review Datastore Import/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByRole('combobox', { name: /Import to Existing Domain/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Import from Domain/i })).toBeInTheDocument();
  });

  it('should show error notification on fetch failure', async() => {
    http.get.mockRejectedValueOnce(new Error('Failed to load'));
    window.API.get.mockResolvedValueOnce(mockDomainsResponse);

    renderWithRedux(
      <ReviewImportForm
        importFileUploadId="test-123"
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      const errorNotification = document.querySelector('.cds--inline-notification--error');
      expect(errorNotification).toBeInTheDocument();
      expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
    });
  });

  it('should show warning when no domains available', async() => {
    http.get.mockResolvedValueOnce(JSON.stringify(mockImportData));
    window.API.get.mockResolvedValueOnce({ resources: [] });

    renderWithRedux(
      <ReviewImportForm
        importFileUploadId="test-123"
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/No Domains Available/i)).toBeInTheDocument();
      expect(screen.getByText(/No enabled domains available to import to/i)).toBeInTheDocument();
    });
  });

  it('should show warning when no data in import file', async() => {
    http.get.mockResolvedValueOnce(JSON.stringify([]));
    window.API.get.mockResolvedValueOnce(mockDomainsResponse);

    renderWithRedux(
      <ReviewImportForm
        importFileUploadId="test-123"
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/No Data/i)).toBeInTheDocument();
      expect(screen.getByText(/No domains found in the import file/i)).toBeInTheDocument();
    });
  });

  it('should render form with submit button initially disabled', async() => {
    http.get.mockResolvedValueOnce(JSON.stringify(mockImportData));
    window.API.get.mockResolvedValueOnce(mockDomainsResponse);

    renderWithRedux(
      <ReviewImportForm
        importFileUploadId="test-123"
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Import from Domain/i })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Commit/i });
    expect(submitButton).toBeDisabled();
  });

  it('should render namespace selection section', async() => {
    http.get.mockResolvedValueOnce(JSON.stringify(mockImportData));
    window.API.get.mockResolvedValueOnce(mockDomainsResponse);

    renderWithRedux(
      <ReviewImportForm
        importFileUploadId="test-123"
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Select Namespaces to Import/i)).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-tree')).toBeInTheDocument();
    });
  });

  it('should call cancel import API when modal is closed', async() => {
    const user = userEvent.setup({ delay: null });
    const mockOnClose = jest.fn();

    http.get.mockResolvedValueOnce(JSON.stringify(mockImportData));
    window.API.get.mockResolvedValueOnce(mockDomainsResponse);
    http.post.mockResolvedValueOnce({});

    renderWithRedux(
      <ReviewImportForm
        importFileUploadId="test-123"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith(
        '/miq_ae_tools/cancel_import',
        { import_file_upload_id: 'test-123' }
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should close error notification when close button is clicked', async() => {
    const user = userEvent.setup({ delay: null });

    http.get.mockRejectedValueOnce(new Error('Test error'));
    window.API.get.mockResolvedValueOnce(mockDomainsResponse);

    renderWithRedux(
      <ReviewImportForm
        importFileUploadId="test-123"
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Test error/i)).toBeInTheDocument();
    });

    // Find the close button within the notification
    const closeButton = document.querySelector('.cds--inline-notification__close-button');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/Test error/i)).not.toBeInTheDocument();
    });
  });

  it('should render both domain selection dropdowns', async() => {
    http.get.mockResolvedValueOnce(JSON.stringify(mockImportData));
    window.API.get.mockResolvedValueOnce(mockDomainsResponse);

    renderWithRedux(
      <ReviewImportForm
        importFileUploadId="test-123"
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Import to Existing Domain/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /Import from Domain/i })).toBeInTheDocument();
    });
  });

  it('should render modal as passive modal', async() => {
    http.get.mockResolvedValueOnce(JSON.stringify(mockImportData));
    window.API.get.mockResolvedValueOnce(mockDomainsResponse);

    renderWithRedux(
      <ReviewImportForm
        importFileUploadId="test-123"
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      const modal = document.querySelector('.cds--modal');
      expect(modal).toBeInTheDocument();
    });
  });
});

// Made with Bob
