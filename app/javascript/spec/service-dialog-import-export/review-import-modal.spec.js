import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ReviewImportModal from '../../components/service-dialog-import-export/review-import-modal';
import { http } from '../../http_api';

jest.mock('../../http_api');

describe('ReviewImportModal component', () => {
  const dialogs = [
    { name: 'New dialog', exists: false },
    { name: 'Existing dialog', exists: true },
  ];

  const renderModal = (props = {}) => renderWithRedux(
    <ReviewImportModal
      importFileUploadId={123}
      dialogs={dialogs}
      onClose={jest.fn()}
      onImportComplete={jest.fn()}
      {...props}
    />
  );

  beforeEach(() => {
    jest.clearAllMocks();
    window.miqFlashLater = jest.fn();
    http.post.mockResolvedValue([]);
  });

  it('should list the dialogs with their status', () => {
    renderModal();
    expect(screen.getByRole('checkbox', { name: 'New dialog' })).toBeInTheDocument();
    expect(screen.getByText('New object')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Existing dialog' })).toBeInTheDocument();
    expect(screen.getByText('This object already exists in the database with the same name')).toBeInTheDocument();
  });

  it('should disable Commit until a dialog is selected', async() => {
    const user = userEvent.setup({ delay: null });
    renderModal();
    const commit = screen.getByRole('button', { name: /^Commit$/i });
    expect(commit).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: 'New dialog' }));
    expect(commit).not.toBeDisabled();
  });

  it('should select all dialogs with the header checkbox', async() => {
    const user = userEvent.setup({ delay: null });
    renderModal();
    await user.click(screen.getByRole('checkbox', { name: /Select all dialogs/i }));

    expect(screen.getByRole('checkbox', { name: 'New dialog' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Existing dialog' })).toBeChecked();
  });

  it('should post the selected dialogs and complete on success', async() => {
    const user = userEvent.setup({ delay: null });
    const onImportComplete = jest.fn();
    const flash = { message: 'Service dialogs imported successfully', level: 'success' };
    http.post.mockResolvedValue([flash]);
    renderModal({ onImportComplete });

    await user.click(screen.getByRole('checkbox', { name: 'New dialog' }));
    await user.click(screen.getByRole('button', { name: /^Commit$/i }));

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith('/miq_ae_customization/import_service_dialogs', {
        import_file_upload_id: 123,
        dialogs_to_import: ['New dialog'],
      });
      expect(window.miqFlashLater).toHaveBeenCalledWith(flash);
      expect(onImportComplete).toHaveBeenCalled();
    });
  });

  it('should show the server error and stay open when the import fails', async() => {
    const user = userEvent.setup({ delay: null });
    const onImportComplete = jest.fn();
    http.post.mockResolvedValue([{ message: 'Error: ImportFileUpload expired', level: 'error' }]);
    renderModal({ onImportComplete });

    await user.click(screen.getByRole('checkbox', { name: 'New dialog' }));
    await user.click(screen.getByRole('button', { name: /^Commit$/i }));

    expect(await screen.findByText('Error: ImportFileUpload expired')).toBeInTheDocument();
    expect(onImportComplete).not.toHaveBeenCalled();
  });

  it('should call the cancel endpoint and close on Cancel', async() => {
    const user = userEvent.setup({ delay: null });
    const onClose = jest.fn();
    renderModal({ onClose });

    await user.click(screen.getByRole('button', { name: /^Cancel$/i }));

    expect(http.post).toHaveBeenCalledWith('/miq_ae_customization/cancel_import_service_dialogs', {
      import_file_upload_id: 123,
    });
    expect(onClose).toHaveBeenCalled();
  });
});
