import {
  act, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

import WorkflowEntryPoints from '../../components/workflows/workflow-entry-points';

describe('WorkflowEntryPoints component', () => {
  const mockWorkflowsResponse = {
    resources: [
      {
        id: 1,
        name: 'provision-vm-service/provision-vm.asl',
        payload_valid: true,
        configuration_script_source: {
          name: 'task test',
        },
      },
      {
        id: 2,
        name: 'provision-vm-service/list-templates.asl',
        payload_valid: true,
        configuration_script_source: {
          name: 'github.com:manageiq/workflows-examples',
        },
      },
    ],
  };

  const defaultProps = {
    field: 'workflow_entry_point',
    type: 'provision',
    selected: '',
  };

  beforeEach(() => {
    window.API = {
      get: jest.fn().mockImplementation(() => Promise.resolve(mockWorkflowsResponse)),
    };
    window.miqJqueryRequest = jest.fn();
    fetchMock.postOnce('/catalog/ae_tree_select_toggle?typ=provision', {});
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    jest.clearAllMocks();
  });

  it('renders modal with table and search input', async() => {
    const { container } = render(<WorkflowEntryPoints {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });

    expect(screen.getByText('task test')).toBeInTheDocument();
    expect(screen.getByText('provision-vm-service/provision-vm.asl')).toBeInTheDocument();
    expect(screen.getByText('github.com:manageiq/workflows-examples')).toBeInTheDocument();
    expect(screen.getByText('provision-vm-service/list-templates.asl')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('filters rows based on search input', async() => {
    render(<WorkflowEntryPoints {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search');
    await act(async() => {
      await userEvent.type(searchInput, 'task test');
    });

    expect(screen.getByText('task test')).toBeInTheDocument();
    expect(screen.getByText('provision-vm-service/provision-vm.asl')).toBeInTheDocument();
    expect(screen.queryByText('github.com:manageiq/workflows-examples')).not.toBeInTheDocument();
    expect(screen.queryByText('provision-vm-service/list-templates.asl')).not.toBeInTheDocument();
  });

  it('filters rows based on workflow name search input', async() => {
    render(<WorkflowEntryPoints {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search');
    await act(async() => {
      await userEvent.type(searchInput, 'list-templates');
    });

    expect(screen.queryByText('task test')).not.toBeInTheDocument();
    expect(screen.getByText('github.com:manageiq/workflows-examples')).toBeInTheDocument();
    expect(screen.getByText('provision-vm-service/list-templates.asl')).toBeInTheDocument();
  });

  it('displays NoRecordsFound when search yields no matches', async() => {
    render(<WorkflowEntryPoints {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search');
    await act(async() => {
      await userEvent.type(searchInput, 'non-existent-workflow');
    });

    expect(screen.getByText('No records found')).toBeInTheDocument();
    expect(screen.queryByText('task test')).not.toBeInTheDocument();
    expect(screen.queryByText('github.com:manageiq/workflows-examples')).not.toBeInTheDocument();
  });

  it('enables Apply button when a row is selected and disables it on deselect', async() => {
    render(<WorkflowEntryPoints {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('provision-vm-service/provision-vm.asl')).toBeInTheDocument();
    });

    const applyButton = screen.getByRole('button', { name: 'Apply' });
    expect(applyButton).toBeDisabled();

    await act(async() => {
      await userEvent.click(screen.getByText('provision-vm-service/provision-vm.asl'));
    });
    expect(applyButton).not.toBeDisabled();
    expect(window.miqJqueryRequest).toHaveBeenCalledWith(
      '/catalog/ae_tree_select/?id=cfp-1&tree=automate_catalog_tree&field=workflow_entry_point&typ=provision'
    );

    // clicking the same row again deselects it
    await act(async() => {
      await userEvent.click(screen.getByText('provision-vm-service/provision-vm.asl'));
    });
    expect(applyButton).toBeDisabled();
  });
});
