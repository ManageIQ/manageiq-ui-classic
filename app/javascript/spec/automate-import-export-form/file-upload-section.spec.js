import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import FileUploadSection from '../../components/automate-import-export-form/file-upload-section';

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

  it('should call miqSparkleOn and submit form when upload button is clicked', async() => {
    const user = userEvent.setup({ delay: null });

    renderWithRedux(<FileUploadSection />);

    const form = document.getElementById('upload-form');
    const submitSpy = jest.spyOn(form, 'submit').mockImplementation(() => {});

    // eslint-disable-next-line no-undef
    const file = new File(['test content'], 'test.zip', { type: 'application/zip' });
    const input = document.querySelector('input[type="file"]');

    await user.upload(input, file);

    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    await user.click(uploadButton);

    expect(window.miqSparkleOn).toHaveBeenCalled();
    expect(submitSpy).toHaveBeenCalled();

    submitSpy.mockRestore();
  });

  it('should handle postMessage event with import_file_upload_id', async() => {
    const mockOnUploadComplete = jest.fn();
    renderWithRedux(<FileUploadSection onUploadComplete={mockOnUploadComplete} />);

    const messageData = {
      import_file_upload_id: 'upload-123',
      message: JSON.stringify({ message: 'Upload successful', level: 'success' }),
    };

    window.postMessage(messageData, '*');

    await waitFor(() => {
      expect(window.miqSparkleOff).toHaveBeenCalled();
      expect(window.add_flash).toHaveBeenCalledWith('Upload successful', 'success');
      expect(mockOnUploadComplete).toHaveBeenCalledWith('upload-123');
    });
  });

  it('should handle postMessage event without message', async() => {
    const mockOnUploadComplete = jest.fn();
    renderWithRedux(<FileUploadSection onUploadComplete={mockOnUploadComplete} />);

    const messageData = {
      import_file_upload_id: 'upload-456',
    };

    window.postMessage(messageData, '*');

    await waitFor(() => {
      expect(window.miqSparkleOff).toHaveBeenCalled();
      expect(mockOnUploadComplete).toHaveBeenCalledWith('upload-456');
    });
  });

  it('should render hidden iframe for form submission', () => {
    renderWithRedux(<FileUploadSection />);

    const iframe = document.querySelector('iframe[name="upload_target"]');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveClass('import-hidden-iframe');
  });

  it('should include CSRF token in form', () => {
    renderWithRedux(<FileUploadSection />);

    const csrfInput = document.querySelector('input[name="authenticity_token"]');
    expect(csrfInput).toBeInTheDocument();
    expect(csrfInput.value).toBe('test-csrf-token');
  });

  it('should have correct form attributes', () => {
    renderWithRedux(<FileUploadSection />);

    const form = document.getElementById('upload-form');
    expect(form).toHaveAttribute('action', '/miq_ae_tools/upload_import_file');
    expect(form).toHaveAttribute('method', 'post');
    expect(form).toHaveAttribute('encType', 'multipart/form-data');
    expect(form).toHaveAttribute('target', 'upload_target');
  });
});
