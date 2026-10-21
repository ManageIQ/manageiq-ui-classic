import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import ContainerGroupLogs from '../../components/container-group-logs';

describe('ContainerGroupLogs', () => {
  const props = {
    podId: '10',
    podName: 'my-pod',
    containers: ['container-a', 'container-b'],
  };

  beforeEach(() => {
    window.API = {
      post: jest.fn(),
      wait_for_task: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the pod title and container options', () => {
    render(<ContainerGroupLogs {...props} />);

    expect(screen.getByText('Logs for my-pod')).toBeInTheDocument();
    expect(screen.getByText('View Logs')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('container-a');
  });

  it('fetches and displays logs on button click when task is returned', async() => {
    API.post.mockResolvedValue({
      success: true,
      message: 'Fetching logs for Pod my-pod',
      task_id: '526',
    });
    API.wait_for_task.mockResolvedValue({
      task_results: 'Pod log output line 1\nPod log output line 2',
    });

    render(<ContainerGroupLogs {...props} />);

    fireEvent.click(screen.getByText('View Logs'));

    expect(API.post).toHaveBeenCalledWith('/api/container_groups/10', {
      action: 'logs',
      container: 'container-a',
    });

    await waitFor(() => {
      expect(API.wait_for_task).toHaveBeenCalledWith('526');
      expect(screen.getByText(/Pod log output line 1/)).toBeInTheDocument();
    });
  });

  it('switches container and fetches logs for the selected container', async() => {
    API.post.mockResolvedValue({ logs: 'Container B logs' });

    render(<ContainerGroupLogs {...props} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'container-b' } });
    fireEvent.click(screen.getByText('View Logs'));

    expect(API.post).toHaveBeenCalledWith('/api/container_groups/10', {
      action: 'logs',
      container: 'container-b',
    });

    await waitFor(() => {
      expect(screen.getByText('Container B logs')).toBeInTheDocument();
    });
  });

  it('displays placeholder text when fetched log is empty', async() => {
    API.post.mockResolvedValue({ logs: '' });

    render(<ContainerGroupLogs {...props} />);

    fireEvent.click(screen.getByText('View Logs'));

    await waitFor(() => {
      expect(screen.getByText('(Log is empty)')).toBeInTheDocument();
    });
  });

  it('displays error notification when API returns an error message', async() => {
    API.post.mockRejectedValue({
      data: { error: { message: 'Container not found' } },
    });

    render(<ContainerGroupLogs {...props} />);

    fireEvent.click(screen.getByText('View Logs'));

    await waitFor(() => {
      expect(screen.getByText('Container not found')).toBeInTheDocument();
    });
  });

  it('disables the button when no container is available', () => {
    render(<ContainerGroupLogs podId="10" podName="empty-pod" containers={[]} />);

    expect(screen.getByText('View Logs')).toBeDisabled();
  });
});
