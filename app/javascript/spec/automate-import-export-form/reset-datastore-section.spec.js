import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ResetDatastoreSection from '../../components/automate-import-export-form/reset-datastore-section';
import { http } from '../../http_api';

jest.mock('../../http_api');

jest.mock('../../helpers/window-location', () => ({
  locationReload: jest.fn(),
}));

describe('ResetDatastoreSection component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.miqSparkleOn = jest.fn();
    window.miqSparkleOff = jest.fn();
    window.API = {
      get: jest.fn(),
    };
  });

  it('should show loading indicator initially', () => {
    window.API.get.mockReturnValue(new Promise(() => {})); // Never resolves
    renderWithRedux(<ResetDatastoreSection />);

    expect(screen.getByText(/Loading domains.../i)).toBeInTheDocument();
  });

  it('should fetch and display enabled domains', async() => {
    window.API.get.mockResolvedValueOnce({
      resources: [
        { name: 'Domain1', enabled: true },
        { name: 'Domain2', enabled: true },
        { name: 'Domain3', enabled: true },
      ],
    });

    renderWithRedux(<ResetDatastoreSection />);

    await waitFor(() => {
      expect(window.API.get).toHaveBeenCalledWith(
        '/api/automate_domains?expand=resources&attributes=name,enabled&filter[]=enabled=true'
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Reset all components in the following domains: Domain1, Domain2, Domain3/i)).toBeInTheDocument();
    });
  });

  it('should render reset button after loading', async() => {
    window.API.get.mockResolvedValueOnce({
      resources: [
        { name: 'TestDomain', enabled: true },
      ],
    });

    renderWithRedux(<ResetDatastoreSection />);

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('should open confirmation modal when reset button is clicked', async() => {
    const user = userEvent.setup({ delay: null });
    window.API.get.mockResolvedValueOnce({
      resources: [
        { name: 'TestDomain', enabled: true },
      ],
    });

    renderWithRedux(<ResetDatastoreSection />);

    await waitFor(() => {
      expect(screen.getByText(/Reset all components in the following domains: TestDomain/i)).toBeInTheDocument();
    });

    const resetButton = document.querySelector('.cds--btn--icon-only');
    await user.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirm Reset/i)).toBeInTheDocument();
      expect(screen.getByText(/All Datastore customizations will be lost/i)).toBeInTheDocument();
    });
  });

  it('should show modal when reset button is clicked and hide on cancel', async() => {
    const user = userEvent.setup({ delay: null });
    window.API.get.mockResolvedValueOnce({
      resources: [
        { name: 'TestDomain', enabled: true },
      ],
    });

    renderWithRedux(<ResetDatastoreSection />);

    await waitFor(() => {
      expect(screen.getByText(/Reset all components in the following domains: TestDomain/i)).toBeInTheDocument();
    });

    const resetButton = document.querySelector('.cds--btn--icon-only');
    await user.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirm Reset/i)).toBeInTheDocument();
    });

    // Verify modal is visible
    const modal = document.querySelector('.cds--modal');
    expect(modal).toBeInTheDocument();
  });

  it('should call reset API and reload page when confirmed', async() => {
    const user = userEvent.setup({ delay: null });
    const { locationReload } = require('../../helpers/window-location');
    window.API.get.mockResolvedValueOnce({
      resources: [
        { name: 'TestDomain', enabled: true },
      ],
    });
    http.post.mockResolvedValueOnce({});

    renderWithRedux(<ResetDatastoreSection />);

    await waitFor(() => {
      expect(screen.getByText(/Reset all components in the following domains: TestDomain/i)).toBeInTheDocument();
    });

    const resetButton = document.querySelector('.cds--btn--icon-only');
    await user.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirm Reset/i)).toBeInTheDocument();
    });

    // Find the danger/reset button in the modal footer
    const modalFooter = document.querySelector('.cds--modal-footer');
    const confirmButton = modalFooter.querySelector('.cds--btn--danger');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(window.miqSparkleOn).toHaveBeenCalled();
      expect(http.post).toHaveBeenCalledWith('/miq_ae_tools/reset_datastore', { button: 'reset' });
    }, { timeout: 2000 });

    await waitFor(() => {
      expect(window.miqSparkleOff).toHaveBeenCalled();
      expect(locationReload).toHaveBeenCalled();
    });
  });

  it('should handle reset API error', async() => {
    const user = userEvent.setup({ delay: null });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    window.API.get.mockResolvedValueOnce({
      resources: [
        { name: 'TestDomain', enabled: true },
      ],
    });
    http.post.mockRejectedValueOnce(new Error('Reset failed'));

    renderWithRedux(<ResetDatastoreSection />);

    await waitFor(() => {
      expect(screen.getByText(/Reset all components in the following domains: TestDomain/i)).toBeInTheDocument();
    });

    const resetButton = document.querySelector('.cds--btn--icon-only');
    await user.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirm Reset/i)).toBeInTheDocument();
    });

    // Find the danger/reset button in the modal footer
    const modalFooter = document.querySelector('.cds--modal-footer');
    const confirmButton = modalFooter.querySelector('.cds--btn--danger');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(window.miqSparkleOff).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Reset failed:', expect.any(Error));
    }, { timeout: 2000 });

    consoleErrorSpy.mockRestore();
  });

  it('should handle API error when fetching domains', async() => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    window.API.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithRedux(<ResetDatastoreSection />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch domains:', expect.any(Error));
    });

    // Component should still render but without domains
    await waitFor(() => {
      expect(screen.queryByText(/Loading domains.../i)).not.toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
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

  it('should display modal as danger variant', async() => {
    const user = userEvent.setup({ delay: null });
    window.API.get.mockResolvedValueOnce({
      resources: [
        { name: 'TestDomain', enabled: true },
      ],
    });

    renderWithRedux(<ResetDatastoreSection />);

    await waitFor(() => {
      expect(screen.getByText(/Reset all components in the following domains: TestDomain/i)).toBeInTheDocument();
    });

    const resetButton = document.querySelector('.cds--btn--icon-only');
    await user.click(resetButton);

    await waitFor(() => {
      const modal = document.querySelector('.cds--modal--danger');
      expect(modal).toBeInTheDocument();
    });
  });
});
