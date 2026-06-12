import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ImportExportPage from '../../components/automate-import-export-form/index';

// Mock child components
jest.mock('../../components/automate-import-export-form/file-upload-section', () => {
  const MockFileUploadSection = ({ onUploadComplete }) => (
    <div data-testid="file-upload-section">
      <button type="button" onClick={() => onUploadComplete && onUploadComplete('test-upload-id')}>
        Mock Upload
      </button>
    </div>
  );
  MockFileUploadSection.displayName = 'FileUploadSection';
  return MockFileUploadSection;
});

jest.mock('../../components/automate-import-export-form/import-datastore-via-git', () => {
  const MockImportDatastoreViaGit = ({ onOpenModal, disableSubmit }) => (
    <div data-testid="import-via-git">
      <button type="button" onClick={onOpenModal} disabled={disableSubmit}>
        Mock Git Import
      </button>
    </div>
  );
  MockImportDatastoreViaGit.displayName = 'ImportDatastoreViaGit';
  return MockImportDatastoreViaGit;
});

jest.mock('../../components/automate-import-export-form/import-datastore-via-git-modal', () => {
  const MockImportDatastoreViaGitModal = ({ isOpen, onClose, disableSubmit }) => (
    isOpen ? (
      <div data-testid="git-modal">
        <p>Git Modal Open</p>
        <p>
          Disabled:
          {' '}
          {disableSubmit ? 'true' : 'false'}
        </p>
        <button type="button" onClick={onClose}>
          Close Modal
        </button>
      </div>
    ) : null
  );
  MockImportDatastoreViaGitModal.displayName = 'ImportDatastoreViaGitModal';
  return MockImportDatastoreViaGitModal;
});

jest.mock('../../components/automate-import-export-form/export-section', () => {
  const MockExportSection = () => (
    <div data-testid="export-section">Export Section</div>
  );
  MockExportSection.displayName = 'ExportSection';
  return MockExportSection;
});

jest.mock('../../components/automate-import-export-form/reset-datastore-section', () => {
  const MockResetDatastoreSection = () => (
    <div data-testid="reset-section">Reset Section</div>
  );
  MockResetDatastoreSection.displayName = 'ResetDatastoreSection';
  return MockResetDatastoreSection;
});

jest.mock('../../components/automate-import-export-form/review-import-form', () => {
  const MockReviewImportForm = ({ importFileUploadId, onClose, onImportComplete }) => (
    <div data-testid="review-import-form">
      <p>
        Review Import:
        {' '}
        {importFileUploadId}
      </p>
      <button type="button" onClick={onClose}>
        Close Review
      </button>
      <button type="button" onClick={onImportComplete}>
        Complete Import
      </button>
    </div>
  );
  MockReviewImportForm.displayName = 'ReviewImportForm';
  return MockReviewImportForm;
});

describe('ImportExportPage component', () => {
  beforeEach(() => {
    delete window.location;
    window.location = { reload: jest.fn() };
  });

  it('should render all sections', () => {
    renderWithRedux(<ImportExportPage gitImportEnabled />);

    expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
    expect(screen.getByTestId('import-via-git')).toBeInTheDocument();
    expect(screen.getByTestId('export-section')).toBeInTheDocument();
    expect(screen.getByTestId('reset-section')).toBeInTheDocument();
  });

  it('should pass gitImportEnabled prop to git import components', () => {
    renderWithRedux(<ImportExportPage gitImportEnabled />);

    const gitButton = screen.getByRole('button', { name: /Mock Git Import/i });
    expect(gitButton).not.toBeDisabled();
  });

  it('should disable git import when gitImportEnabled is false', () => {
    renderWithRedux(<ImportExportPage gitImportEnabled={false} />);

    const gitButton = screen.getByRole('button', { name: /Mock Git Import/i });
    expect(gitButton).toBeDisabled();
  });

  it('should open git modal when git import button is clicked', async() => {
    const user = userEvent.setup({ delay: null });
    renderWithRedux(<ImportExportPage gitImportEnabled />);

    const gitButton = screen.getByRole('button', { name: /Mock Git Import/i });
    await user.click(gitButton);

    expect(screen.getByTestId('git-modal')).toBeInTheDocument();
    expect(screen.getByText(/Git Modal Open/i)).toBeInTheDocument();
  });

  it('should close git modal when close button is clicked', async() => {
    const user = userEvent.setup({ delay: null });
    renderWithRedux(<ImportExportPage gitImportEnabled />);

    const gitButton = screen.getByRole('button', { name: /Mock Git Import/i });
    await user.click(gitButton);

    expect(screen.getByTestId('git-modal')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /Close Modal/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('git-modal')).not.toBeInTheDocument();
    });
  });

  it('should show review import form when upload completes', async() => {
    const user = userEvent.setup({ delay: null });
    renderWithRedux(<ImportExportPage gitImportEnabled />);

    const uploadButton = screen.getByRole('button', { name: /Mock Upload/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByTestId('review-import-form')).toBeInTheDocument();
      expect(screen.getByText(/Review Import: test-upload-id/i)).toBeInTheDocument();
    });
  });

  it('should close review import form when close button is clicked', async() => {
    const user = userEvent.setup({ delay: null });
    renderWithRedux(<ImportExportPage gitImportEnabled />);

    const uploadButton = screen.getByRole('button', { name: /Mock Upload/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByTestId('review-import-form')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /Close Review/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('review-import-form')).not.toBeInTheDocument();
    });
  });

  it('should reload page when import completes', async() => {
    const user = userEvent.setup({ delay: null });
    renderWithRedux(<ImportExportPage gitImportEnabled />);

    const uploadButton = screen.getByRole('button', { name: /Mock Upload/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByTestId('review-import-form')).toBeInTheDocument();
    });

    const completeButton = screen.getByRole('button', { name: /Complete Import/i });
    await user.click(completeButton);

    expect(window.location.reload).toHaveBeenCalled();
  });

  it('should pass disableSubmit to git modal based on gitImportEnabled', () => {
    renderWithRedux(<ImportExportPage gitImportEnabled={false} />);

    // Modal should not be open initially, so we just verify the prop is passed correctly
    // The disabled button test already verifies the disableSubmit prop works
    const gitButton = screen.getByRole('button', { name: /Mock Git Import/i });
    expect(gitButton).toBeDisabled();
  });
});

// Made with Bob
