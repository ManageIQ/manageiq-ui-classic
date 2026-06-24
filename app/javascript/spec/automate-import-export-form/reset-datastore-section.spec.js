import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ResetDatastoreSection from '../../components/automate-import-export-form/reset-datastore-section';
import { http } from '../../http_api';
import { locationReload } from '../../helpers/window-location';

jest.mock('../../http_api');

jest.mock('../../helpers/window-location', () => ({
  locationReload: jest.fn(),
}));

describe('ResetDatastoreSection component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.API = {
      get: jest.fn(),
    };
  });

  it('should show loading indicator initially', () => {
    window.API.get.mockReturnValue(new Promise(() => {})); // Never resolves
    renderWithRedux(<ResetDatastoreSection />);

    expect(screen.getByText(/Loading domains.../i)).toBeInTheDocument();
  });

  it('should fetch and display system domains', async() => {
    window.API.get.mockResolvedValueOnce({
      resources: [
        { name: 'Domain1', source: 'system' },
        { name: 'Domain2', source: 'system' },
        { name: 'Domain3', source: 'system' },
      ],
    });

    renderWithRedux(<ResetDatastoreSection />);

    await waitFor(() => {
      expect(window.API.get).toHaveBeenCalledWith(
        '/api/automate_domains?expand=resources&attributes=name,enabled&filter[]=source=system'
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Reset all components in the following domains: Domain1, Domain2, Domain3/i)).toBeInTheDocument();
    });
  });

  it('should render reset button after loading', async() => {
    window.API.get.mockResolvedValueOnce({
      resources: [
        { name: 'TestDomain', source: 'system' },
      ],
    });

    renderWithRedux(<ResetDatastoreSection />);

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('should call reset API and reload page when confirmed', async() => {
    const user = userEvent.setup({ delay: null });
    window.API.get.mockResolvedValueOnce({
      resources: [
        { name: 'TestDomain', source: 'system' },
      ],
    });
    http.post.mockResolvedValueOnce({});

    renderWithRedux(<ResetDatastoreSection />);

    await waitFor(() => {
      expect(screen.getByText(/Reset all components in the following domains: TestDomain/i)).toBeInTheDocument();
    });

    const resetButton = document.querySelector('.cds--btn--icon-only');
    await user.click(resetButton);

    // Find the danger/reset button in the modal footer
    const modalFooter = document.querySelector('.cds--modal-footer');
    const confirmButton = modalFooter.querySelector('.cds--btn--danger');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith('/miq_ae_tools/reset_datastore', { button: 'reset' });
      expect(locationReload).toHaveBeenCalled();
    });
  });

  it('should handle empty domains list', async() => {
    window.API.get.mockResolvedValueOnce({
      resources: [],
    });

    renderWithRedux(<ResetDatastoreSection />);

    await waitFor(() => {
      expect(screen.getByText(/Reset all components in the following domains:/i)).toBeInTheDocument();
    });
  });
});
