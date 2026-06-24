import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ApForm from '../../components/ap-form';

describe('ApForm component', () => {
  const defaultProps = {
    scanId: 'new',
    scanMode: 'Vm',
    initialData: null,
  };

  const vmModeData = {
    name: 'Test Profile',
    description: 'Test Description',
    scan_mode: 'Vm',
    category: { system: true, services: true },
    file_names: [
      { target: '/etc/hosts', content: true },
      { target: '/var/log/messages', content: false },
    ],
    reg_entries: [
      {
        depth: 0,
        hive: 'HKLM',
        key: 'Software\\Test',
        value: 'TestValue',
      },
    ],
    nteventlog_entries: [
      {
        name: 'Application',
        filter: {
          message: 'Error',
          level: 'Error',
          source: 'TestApp',
          num_days: 7,
        },
      },
    ],
  };

  const hostModeData = {
    ...vmModeData,
    scan_mode: 'Host',
  };

  beforeEach(() => {
    global.miqSparkleOn = jest.fn();
    global.miqSparkleOff = jest.fn();
    global.add_flash = jest.fn();
    global.miqRedirectBack = jest.fn();
    global.http = {
      post: jest.fn(() => Promise.resolve({ data: {} })),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields', async() => {
    renderWithRedux(<ApForm {...defaultProps} initialData={vmModeData} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
  });

  it('should render all tabs for VM mode', async() => {
    renderWithRedux(<ApForm {...defaultProps} initialData={vmModeData} />);

    await waitFor(() => {
      expect(screen.getByText('Category')).toBeInTheDocument();
    });
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Registry')).toBeInTheDocument();
    expect(screen.getByText('Event Log')).toBeInTheDocument();
  });

  it('should render only File and Event Log tabs for Host mode', async() => {
    renderWithRedux(<ApForm {...defaultProps} scanMode="Host" initialData={hostModeData} />);

    await waitFor(() => {
      expect(screen.getByText('File')).toBeInTheDocument();
    });
    expect(screen.queryByText('Category')).not.toBeInTheDocument();
    expect(screen.queryByText('Registry')).not.toBeInTheDocument();
    expect(screen.getByText('Event Log')).toBeInTheDocument();
  });

  describe('Category Tab', () => {
    it('should render category checkboxes', async() => {
      renderWithRedux(<ApForm {...defaultProps} initialData={vmModeData} />);

      await waitFor(() => {
        expect(screen.getByLabelText('System')).toBeInTheDocument();
      });
      expect(screen.getByLabelText('System')).toBeChecked();
      expect(screen.getByLabelText('Services')).toBeChecked();
      expect(screen.getByLabelText('Software')).not.toBeChecked();
      expect(screen.getByLabelText('User Accounts')).not.toBeChecked();
      expect(screen.getByLabelText('VM Configuration')).not.toBeChecked();
    });

    it('should handle category checkbox changes', async() => {
      const user = userEvent.setup();
      renderWithRedux(<ApForm {...defaultProps} initialData={vmModeData} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Software')).toBeInTheDocument();
      });

      const softwareCheckbox = screen.getByLabelText('Software');
      await user.click(softwareCheckbox);

      expect(softwareCheckbox).toBeChecked();
    });
  });

  describe('File Tab', () => {
    it('should render file entries', async() => {
      renderWithRedux(<ApForm {...defaultProps} initialData={vmModeData} />);

      await waitFor(() => {
        expect(screen.getByText('File')).toBeInTheDocument();
      });

      const fileTab = screen.getByText('File');
      await userEvent.click(fileTab);

      await waitFor(() => {
        expect(screen.getByText('/etc/hosts')).toBeInTheDocument();
      });
      expect(screen.getByText('/var/log/messages')).toBeInTheDocument();
    });

    it('should allow adding new file entries', async() => {
      const user = userEvent.setup();
      renderWithRedux(<ApForm {...defaultProps} initialData={vmModeData} />);

      await waitFor(() => {
        expect(screen.getByText('File')).toBeInTheDocument();
      });

      const fileTab = screen.getByText('File');
      await user.click(fileTab);

      await waitFor(() => {
        expect(screen.getByLabelText('File Name')).toBeInTheDocument();
      });

      const fileNameInput = screen.getByLabelText('File Name');
      await user.type(fileNameInput, '/tmp/test.log');

      // Find the Add button within the File tab section
      const addButtons = screen.getAllByRole('button', { name: /add/i });
      const fileAddButton = addButtons.find((btn) => btn.closest('.ap-form-file'));
      await user.click(fileAddButton);

      await waitFor(() => {
        expect(screen.getByText('/tmp/test.log')).toBeInTheDocument();
      });
    });
  });

  describe('Registry Tab', () => {
    it('should render registry entries', async() => {
      const user = userEvent.setup();
      renderWithRedux(<ApForm {...defaultProps} initialData={vmModeData} />);

      await waitFor(() => {
        expect(screen.getByText('Registry')).toBeInTheDocument();
      });

      const registryTab = screen.getByText('Registry');
      await user.click(registryTab);

      await waitFor(() => {
        expect(screen.getByText('Software\\Test')).toBeInTheDocument();
      });
      expect(screen.getByText('TestValue')).toBeInTheDocument();
    });

    it('should allow adding new registry entries', async() => {
      const user = userEvent.setup();
      renderWithRedux(<ApForm {...defaultProps} initialData={vmModeData} />);

      await waitFor(() => {
        expect(screen.getByText('Registry')).toBeInTheDocument();
      });

      const registryTab = screen.getByText('Registry');
      await user.click(registryTab);

      await waitFor(() => {
        expect(screen.getByLabelText('Registry Key')).toBeInTheDocument();
      });

      const keyInput = screen.getByLabelText('Registry Key');
      const valueInput = screen.getByLabelText('Registry Value');

      await user.type(keyInput, 'Software\\NewKey');
      await user.type(valueInput, 'NewValue');

      // Find the Add button within the Registry tab section
      const addButtons = screen.getAllByRole('button', { name: /add/i });
      const registryAddButton = addButtons.find((btn) => btn.closest('.ap-form-registry'));
      await user.click(registryAddButton);

      await waitFor(() => {
        expect(screen.getByText('Software\\NewKey')).toBeInTheDocument();
      });
    });
  });

  describe('Event Log Tab', () => {
    it('should render event log entries', async() => {
      const user = userEvent.setup();
      renderWithRedux(<ApForm {...defaultProps} initialData={vmModeData} />);

      await waitFor(() => {
        expect(screen.getByText('Event Log')).toBeInTheDocument();
      });

      const eventLogTab = screen.getByText('Event Log');
      await user.click(eventLogTab);

      await waitFor(() => {
        expect(screen.getByText('Application')).toBeInTheDocument();
      });
      // Use getAllByText since "Error" appears multiple times (message and level)
      const errorTexts = screen.getAllByText('Error');
      expect(errorTexts.length).toBeGreaterThan(0);
      expect(screen.getByText('TestApp')).toBeInTheDocument();
    });

    it('should allow adding new event log entries', async() => {
      const user = userEvent.setup();
      renderWithRedux(<ApForm {...defaultProps} initialData={vmModeData} />);

      await waitFor(() => {
        expect(screen.getByText('Event Log')).toBeInTheDocument();
      });

      const eventLogTab = screen.getByText('Event Log');
      await user.click(eventLogTab);

      await waitFor(() => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText('Name');
      await user.type(nameInput, 'Security');

      // Find the Add button within the Event Log tab section
      const addButtons = screen.getAllByRole('button', { name: /add/i });
      const eventLogAddButton = addButtons.find((btn) => btn.closest('.ap-form-eventlog'));
      await user.click(eventLogAddButton);

      await waitFor(() => {
        expect(screen.getByText('Security')).toBeInTheDocument();
      });
    });
  });

  describe('Form submission', () => {
    it('should have submit button', async() => {
      renderWithRedux(<ApForm {...defaultProps} initialData={vmModeData} />);

      await waitFor(() => {
        const submitButtons = screen.getAllByRole('button', { name: /add/i });
        // The form submit button should be present
        const formSubmitButton = submitButtons.find((btn) => btn.type === 'submit');
        expect(formSubmitButton).toBeInTheDocument();
      });
    });

    it('should have cancel button', async() => {
      renderWithRedux(<ApForm {...defaultProps} initialData={vmModeData} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
    });
  });
});
