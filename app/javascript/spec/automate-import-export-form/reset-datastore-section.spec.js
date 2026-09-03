import { screen, waitFor, within } from '@testing-library/react';
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
    window.add_flash = jest.fn();
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

    // Open confirmation modal
    await user.click(screen.getByRole('button', { name: /^Reset$/i }));

    // Wait for modal to open then click the modal's primary danger button
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to reset/i)).toBeInTheDocument();
    });

    const modal = screen.getByRole('dialog');
    await user.click(within(modal).getByRole('button', { name: /Reset/i }));

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith('/miq_ae_tools/reset_datastore', { button: 'reset' });
      expect(locationReload).toHaveBeenCalled();
    });
  });

  it('should show error notification when reset fails', async() => {
    const user = userEvent.setup({ delay: null });
    window.API.get.mockResolvedValueOnce({
      resources: [{ name: 'TestDomain', source: 'system' }],
    });
    http.post.mockRejectedValueOnce(new Error('Reset failed'));

    renderWithRedux(<ResetDatastoreSection />);

    await waitFor(() => {
      expect(screen.getByText(/Reset all components in the following domains: TestDomain/i)).toBeInTheDocument();
    });

    // Open confirmation modal
    await user.click(screen.getByRole('button', { name: /^Reset$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to reset/i)).toBeInTheDocument();
    });

    const modal = screen.getByRole('dialog');
    await user.click(within(modal).getByRole('button', { name: /Reset/i }));

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith('/miq_ae_tools/reset_datastore', { button: 'reset' });
      expect(locationReload).not.toHaveBeenCalled();
    });
  });

  it('should call add_flash when API.get fails to fetch domains', async() => {
    window.API.get.mockRejectedValueOnce(new Error('Network error'));

    renderWithRedux(<ResetDatastoreSection />);

    await waitFor(() => {
      expect(window.add_flash).toHaveBeenCalledWith('Network error', 'error');
    });

    // Loading spinner should be cleared
    expect(screen.queryByText(/Loading domains/i)).not.toBeInTheDocument();
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
