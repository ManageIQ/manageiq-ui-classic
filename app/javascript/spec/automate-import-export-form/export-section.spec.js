import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ExportSection from '../../components/automate-import-export-form/export-section';

jest.mock('../../helpers/window-location', () => ({
  setLocationHref: jest.fn(),
}));

describe('ExportSection component', () => {
  it('should render the heading and button', () => {
    renderWithRedux(<ExportSection />);

    expect(screen.getByRole('heading', { name: /Export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export all classes and instances to a file/i })).toBeInTheDocument();
  });

  it('should navigate to export URL when button is clicked', async() => {
    const user = userEvent.setup({ delay: null });
    const { setLocationHref } = require('../../helpers/window-location');
    renderWithRedux(<ExportSection />);

    const button = screen.getByRole('button', { name: /Export all classes and instances to a file/i });
    await user.click(button);

    expect(setLocationHref).toHaveBeenCalledWith('/miq_ae_tools/export_datastore');
  });
});
