import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import FileUploadSection from '../../components/automate-import-export-form/file-upload-section';
import { miqFetch } from '../../http_api/fetch';

jest.mock('../../http_api/fetch');

describe('FileUploadSection component', () => {
  beforeEach(() => {
    window.miqSparkleOn = jest.fn();
    window.miqSparkleOff = jest.fn();
    window.add_flash = jest.fn();

    // Mock CSRF token
    const meta = document.createElement('meta');
    meta.name = 'csrf-token';
    meta.content = 'test-csrf-token';
    document.head.appendChild(meta);

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) {
      meta.remove();
    }
  });

  it('should render the heading and file uploader', () => {
    renderWithRedux(<FileUploadSection />);

    expect(screen.getByText(/Import Datastore classes/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload file/i)).toBeInTheDocument();
  });

  it('should have upload button disabled initially', () => {
    renderWithRedux(<FileUploadSection />);

    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    expect(uploadButton).toBeDisabled();
  });

  it('should enable upload button when file is selected', async() => {
    const user = userEvent.setup({ delay: null });
    renderWithRedux(<FileUploadSection />);

    // eslint-disable-next-line no-undef
    const file = new File(['test content'], 'test.zip', { type: 'application/zip' });
    const input = document.querySelector('input[type="file"]');

    await user.upload(input, file);

    await waitFor(() => {
      const uploadButton = screen.getByRole('button', { name: /Upload/i });
      expect(uploadButton).not.toBeDisabled();
    });
  });

  it('should disable upload button when selected file is removed', async() => {
    const user = userEvent.setup({ delay: null });
    renderWithRedux(<FileUploadSection />);

    // eslint-disable-next-line no-undef
    const file = new File(['test content'], 'test.zip', { type: 'application/zip' });
    const input = document.querySelector('input[type="file"]');

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Upload/i })).not.toBeDisabled();
    });

    const clearButton = screen.getByRole('button', { name: /Clear file/i });
    await user.click(clearButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Upload/i })).toBeDisabled();
    });
  });

  it('should only allow selecting one file', async() => {
    renderWithRedux(<FileUploadSection />);

    const input = document.querySelector('input[type="file"]');
    expect(input).not.toHaveAttribute('multiple');
  });

  it('should call miqFetch with FormData when upload button is clicked', async() => {
    const user = userEvent.setup({ delay: null });
    const mockOnUploadComplete = jest.fn();

    miqFetch.mockResolvedValue({
      import_file_upload_id: 'upload-123',
      message: 'Upload successful',
      level: 'success',
    });

    renderWithRedux(<FileUploadSection onUploadComplete={mockOnUploadComplete} />);

    // eslint-disable-next-line no-undef
    const file = new File(['test content'], 'test.zip', { type: 'application/zip' });
    const input = document.querySelector('input[type="file"]');

    await user.upload(input, file);

    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    await user.click(uploadButton);

    expect(window.miqSparkleOn).toHaveBeenCalled();

    await waitFor(() => {
      expect(miqFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/miq_ae_tools/upload_import_file',
          method: 'POST',
          cookieAndCsrf: true,
        }),
        expect.any(FormData)
      );
      expect(window.add_flash).toHaveBeenCalledWith('Upload successful', 'success');
      expect(mockOnUploadComplete).toHaveBeenCalledWith('upload-123');
      expect(window.miqSparkleOff).toHaveBeenCalled();
    });
  });

  it('should handle upload errors', async() => {
    const user = userEvent.setup({ delay: null });

    miqFetch.mockRejectedValue({
      data: { message: 'Upload failed' },
      status: 400,
    });

    renderWithRedux(<FileUploadSection />);

    // eslint-disable-next-line no-undef
    const file = new File(['test content'], 'test.zip', { type: 'application/zip' });
    const input = document.querySelector('input[type="file"]');

    await user.upload(input, file);

    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(window.add_flash).toHaveBeenCalledWith('Upload failed', 'error');
      expect(window.miqSparkleOff).toHaveBeenCalled();
    });
  });

  it('should disable upload button while uploading', async() => {
    const user = userEvent.setup({ delay: null });

    // Mock a slow upload
    miqFetch.mockImplementation(() => new Promise((resolve) => {
      setTimeout(() => resolve({
        import_file_upload_id: 'upload-123',
        message: 'Upload successful',
        level: 'success',
      }), 100);
    }));

    renderWithRedux(<FileUploadSection />);

    // eslint-disable-next-line no-undef
    const file = new File(['test content'], 'test.zip', { type: 'application/zip' });
    const input = document.querySelector('input[type="file"]');

    await user.upload(input, file);

    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    await user.click(uploadButton);

    // Button should show "Uploading..." and be disabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Uploading/i })).toBeDisabled();
    });

    // Wait for upload to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Upload$/i })).toBeInTheDocument();
    });
  });
});

// Made with Bob
