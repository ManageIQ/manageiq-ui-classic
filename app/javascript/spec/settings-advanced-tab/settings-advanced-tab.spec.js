import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import mockStoreFactory from 'redux-mock-store';
import SettingsAdvancedTab from '../../components/settings-advanced-tab';

const mockStore = mockStoreFactory([]);
const store = mockStore({});

const defaultProps = {
  resourceType: 'server',
  resourceId: '1',
  warningText: 'Caution: Manual changes to configuration files can disable the Server!',
  infoText: "To reset back to the Zone's setting or to delete a setting, set the value to <<reset>>.",
};

const renderComponent = (props = {}) => render(
  <Provider store={store}>
    <SettingsAdvancedTab {...defaultProps} {...props} />
  </Provider>,
);

describe('SettingsAdvancedTab', () => {
  beforeEach(() => {
    http.get = jest.fn().mockResolvedValue({ file_data: 'key: value\n' });
    http.post = jest.fn().mockResolvedValue({ success: true, message: 'Configuration changes saved' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading spinner on mount', () => {
    http.get = jest.fn(() => new Promise(() => {}));
    renderComponent();
    expect(document.querySelector('.cds--loading')).toBeInTheDocument();
  });

  it('fetches and renders the YAML editor after load', async() => {
    renderComponent();
    await waitFor(() => {
      expect(http.get).toHaveBeenCalledWith(
        '/ops/settings_advanced_tab_data?resource_type=server&resource_id=1',
      );
    });
    expect(document.querySelector('.CodeMirror')).toBeInTheDocument();
  });

  it('renders warning and info notifications', async() => {
    renderComponent();
    await waitFor(() => expect(document.querySelector('.CodeMirror')).toBeInTheDocument());
    expect(screen.getByText(defaultProps.warningText)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.infoText)).toBeInTheDocument();
  });

  it('omits notifications when props are absent', async() => {
    renderComponent({ warningText: undefined, infoText: undefined });
    await waitFor(() => expect(document.querySelector('.CodeMirror')).toBeInTheDocument());
    expect(screen.queryByText(defaultProps.warningText)).not.toBeInTheDocument();
    expect(screen.queryByText(defaultProps.infoText)).not.toBeInTheDocument();
  });

  it('renders Save and Reset buttons', async() => {
    renderComponent();
    await waitFor(() => expect(document.querySelector('.CodeMirror')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('POSTs to settings_advanced_save on submit', async() => {
    renderComponent();
    await waitFor(() => expect(document.querySelector('.CodeMirror')).toBeInTheDocument());
    // Submit the form directly — the Save button is disabled until the form is dirtied,
    // but fireEvent.submit bypasses that so we can verify the handler wiring.
    fireEvent.submit(document.querySelector('form'));
    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith(
        '/ops/settings_advanced_save',
        expect.objectContaining({ resource_type: 'server', resource_id: '1' }),
        { skipErrors: [422] },
      );
    });
  });

  it('re-fetches YAML after a successful save', async() => {
    renderComponent();
    await waitFor(() => expect(document.querySelector('.CodeMirror')).toBeInTheDocument());
    fireEvent.submit(document.querySelector('form'));
    await waitFor(() => {
      // GET called once on mount + once after save
      expect(http.get).toHaveBeenCalledTimes(2);
    });
  });
});
