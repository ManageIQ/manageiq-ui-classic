import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ServiceDialogImportExport from '../../components/service-dialog-import-export';
import { miqFetch } from '../../http_api/fetch';

jest.mock('../../http_api/fetch');
jest.mock('../../http_api');

describe('ServiceDialogImportExport component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.add_flash = jest.fn();
  });

  it('should render the import and export sections without the review modal', () => {
    const { container } = renderWithRedux(<ServiceDialogImportExport dialogExports={[['Dialog A', 1]]} />);

    expect(container).toMatchSnapshot();
    expect(screen.getByRole('heading', { name: 'Import' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument();
    expect(screen.queryByText('Import Service Dialogs')).not.toBeInTheDocument();
  });

  it('should open the review modal after a successful upload', async() => {
    const user = userEvent.setup({ delay: null });
    miqFetch.mockResolvedValue({
      import_file_upload_id: 123,
      dialogs: [{ name: 'dialog 1', exists: false }],
      message: 'Select Dialogs to import',
      level: 'info',
    });
    renderWithRedux(<ServiceDialogImportExport dialogExports={[]} />);

    // eslint-disable-next-line no-undef
    await user.upload(screen.getByLabelText(/Choose file/i), new File(['yaml'], 'dialogs.yml'));
    await user.click(screen.getByRole('button', { name: /^Upload$/i }));

    await waitFor(() => {
      expect(screen.getByText('Import Service Dialogs')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'dialog 1' })).toBeInTheDocument();
    });
  });
});
