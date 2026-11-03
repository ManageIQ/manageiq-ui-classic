import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ExportSection from '../../components/service-dialog-import-export/export-section';
import { setLocationHref } from '../../helpers/window-location';

jest.mock('../../helpers/window-location', () => ({
  setLocationHref: jest.fn(),
}));

describe('Service dialog ExportSection component', () => {
  const dialogExports = [['Dialog A', 1], ['Dialog B', 2]];

  beforeEach(() => jest.clearAllMocks());

  it('should disable the export button when nothing is selected', () => {
    renderWithRedux(<ExportSection dialogExports={dialogExports} />);
    expect(screen.getByRole('button', { name: /^Export$/i })).toBeDisabled();
  });

  it('should navigate to the export url with the selected dialogs', async() => {
    const user = userEvent.setup({ delay: null });
    renderWithRedux(<ExportSection dialogExports={dialogExports} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText('Dialog A'));
    await user.click(await screen.findByText('Dialog B'));
    await user.click(screen.getByRole('button', { name: /^Export$/i }));

    expect(setLocationHref).toHaveBeenCalledWith(
      '/miq_ae_customization/export_service_dialogs?service_dialogs[]=1&service_dialogs[]=2'
    );
  });
});
