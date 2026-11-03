import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ImportSection from '../../components/service-dialog-import-export/import-section';
import { miqFetch } from '../../http_api/fetch';
import miqFlash from '../../helpers/miq-flash';

jest.mock('../../http_api/fetch');
jest.mock('../../helpers/miq-flash');

describe('Service dialog ImportSection component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const chooseFile = async(user) => {
    // eslint-disable-next-line no-undef
    const file = new File(['yaml'], 'dialogs.yml', { type: 'text/yaml' });
    await user.upload(screen.getByLabelText(/Choose file/i), file);
  };

  it('should disable the upload button until a file is chosen', () => {
    renderWithRedux(<ImportSection onUploadComplete={jest.fn()} />);
    expect(screen.getByRole('button', { name: /^Upload$/i })).toBeDisabled();
  });

  it('should only allow selecting one file', () => {
    renderWithRedux(<ImportSection onUploadComplete={jest.fn()} />);
    expect(screen.getByLabelText(/Choose file/i)).not.toHaveAttribute('multiple');
  });

  it('should post FormData and report the upload id and dialogs', async() => {
    const user = userEvent.setup({ delay: null });
    const onUploadComplete = jest.fn();
    const dialogs = [{ name: 'dialog 1', exists: false }];
    miqFetch.mockResolvedValue({
      import_file_upload_id: 123, dialogs, message: 'Select Dialogs to import', level: 'info',
    });

    renderWithRedux(<ImportSection onUploadComplete={onUploadComplete} />);
    await chooseFile(user);
    await user.click(screen.getByRole('button', { name: /^Upload$/i }));

    await waitFor(() => {
      expect(miqFetch).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/miq_ae_customization/upload_import_file', method: 'POST', cookieAndCsrf: true }),
        expect.any(FormData)
      );
      expect(miqFlash).toHaveBeenCalledWith('info', 'Select Dialogs to import');
      expect(onUploadComplete).toHaveBeenCalledWith(123, dialogs);
    });
  });

  it('should flash a warning and not open the review when the response has no upload id', async() => {
    const user = userEvent.setup({ delay: null });
    const onUploadComplete = jest.fn();
    miqFetch.mockResolvedValue({ message: 'Error: the uploaded file is blank', level: 'error' });

    renderWithRedux(<ImportSection onUploadComplete={onUploadComplete} />);
    await chooseFile(user);
    await user.click(screen.getByRole('button', { name: /^Upload$/i }));

    await waitFor(() => {
      expect(miqFlash).toHaveBeenCalledWith('error', 'Error: the uploaded file is blank');
    });
    expect(onUploadComplete).not.toHaveBeenCalled();
  });
});
