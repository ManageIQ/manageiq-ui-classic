import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ImportDatastoreViaGitModal from '../../components/automate-import-export-form/import-datastore-via-git-modal';
import { http } from '../../http_api';

jest.mock('../../http_api');

describe('ImportDatastoreViaGitModal component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Default mock to prevent errors in afterEach cleanup
    http.get.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Modal Visibility', () => {
    it('should not show modal content when isOpen is false', () => {
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();
      const { container } = renderWithRedux(
        <ImportDatastoreViaGitModal isOpen={false} onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} />
      );

      // Carbon Modal still renders in DOM but is hidden, check for the open prop
      const modal = container.querySelector('.cds--modal');
      expect(modal).toHaveClass('cds--modal');
      expect(modal).not.toHaveClass('is-visible');
    });

    it('should render when isOpen is true', () => {
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();
      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} />
      );

      expect(screen.getByText(/Import Datastore via Git/i)).toBeInTheDocument();
    });
  });

  describe('Stage 1: Git URL Form', () => {
    it('should render the git URL form initially', () => {
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();
      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} />
      );

      expect(screen.getByLabelText(/Git URL/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Verify Peer Certificate/i)).toBeInTheDocument();
    });

    it('should have submit button disabled when form is invalid', () => {
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();
      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} />
      );
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toBeDisabled();
    });

    it('should enable submit button when valid URL is entered', async() => {
      const user = userEvent.setup({ delay: null });
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();
      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} />
      );

      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /submit/i });
        expect(button).not.toBeDisabled();
      });
    });

    it('should show disabled message when disableSubmit prop is true', () => {
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();
      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} disableSubmit />
      );

      expect(screen.getByText(/Please enable the git owner role/i)).toBeInTheDocument();
    });

    it('should keep submit button disabled when disableSubmit is true', async() => {
      const user = userEvent.setup({ delay: null });
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();
      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} disableSubmit />
      );

      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');

      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toBeDisabled();
    });
  });

  describe('Stage 2: Task Polling and Branch/Tag Selection', () => {
    it('should show loading indicator after git URL submission', async() => {
      const user = userEvent.setup({ delay: null });
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();

      http.post.mockResolvedValueOnce({
        task_id: 'task-123',
        git_repo_id: 'repo-456',
        new_git_repo: true,
      });
      http.get.mockResolvedValueOnce({
        state: 'Active',
      });

      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} />
      );

      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(http.post).toHaveBeenCalledWith(
          '/miq_ae_tools/retrieve_git_datastore',
          expect.objectContaining({
            git_url: 'https://github.com/test/repo.git',
            git_verify_ssl: true,
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
      });

      // Fast-forward timers to trigger polling
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(http.get).toHaveBeenCalledWith('/miq_ae_tools/check_git_task?task_id=task-123&git_repo_id=repo-456&new_git_repo=true');
      });
    });

    it('should show success notification and branch/tag selection form when task completes', async() => {
      const user = userEvent.setup({ delay: null });
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();

      http.post.mockResolvedValueOnce({
        task_id: 'task-123',
        git_repo_id: 'repo-456',
        new_git_repo: true,
      });
      http.get.mockResolvedValueOnce({
        state: 'Finished',
        success: true,
        git_repo_id: 'repo-456',
        git_branches: ['main', 'develop', 'feature/test'],
        git_tags: ['v1.0.0', 'v2.0.0'],
      });

      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} />
      );

      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Fast-forward timers to trigger polling
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText(/Choose the branch or tag you would like to import/i)).toBeInTheDocument();
      });

      // Check for success notification
      expect(screen.getByText(/Successfully found git repository, please choose a branch or tag/i)).toBeInTheDocument();

      expect(screen.getByLabelText(/Branch\/Tag/i)).toBeInTheDocument();
    });

    it('should show error notification when task fails', async() => {
      const user = userEvent.setup({ delay: null });
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();

      http.post.mockResolvedValueOnce({
        task_id: 'task-123',
        git_repo_id: 'repo-456',
        new_git_repo: true,
      });
      http.get.mockResolvedValueOnce({
        success: false,
        message: {
          message: 'Failed to fetch repository',
          level: 'error',
        },
      });

      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} />
      );

      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Fast-forward timers to trigger polling
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch repository/i)).toBeInTheDocument();
      });
    });

    it('should handle API error during git URL submission', async() => {
      const user = userEvent.setup({ delay: null });
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();

      http.post.mockRejectedValueOnce(new Error('Network error'));

      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} />
      );

      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Branch/Tag Selection and Import', () => {
    it('should show branches by default', async() => {
      const user = userEvent.setup({ delay: null });
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();

      http.post.mockResolvedValueOnce({
        task_id: 'task-123',
        git_repo_id: 'repo-456',
        new_git_repo: true,
      });
      http.get.mockResolvedValueOnce({
        state: 'Finished',
        success: true,
        git_repo_id: 'repo-456',
        git_branches: ['main', 'develop'],
        git_tags: ['v1.0.0', 'v2.0.0'],
      });

      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} />
      );

      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText(/Choose the branch or tag you would like to import/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/Branches/i)).toBeInTheDocument();
      });
    });

    it('should switch to tags when tag option is selected', async() => {
      const user = userEvent.setup({ delay: null });
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();

      http.post.mockResolvedValueOnce({
        task_id: 'task-123',
        git_repo_id: 'repo-456',
        new_git_repo: true,
      });
      http.get.mockResolvedValueOnce({
        state: 'Finished',
        success: true,
        git_repo_id: 'repo-456',
        git_branches: ['main', 'develop'],
        git_tags: ['v1.0.0', 'v2.0.0'],
      });

      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} />
      );

      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText(/Choose the branch or tag you would like to import/i)).toBeInTheDocument();
      });

      const refTypeSelect = screen.getByLabelText(/Branch\/Tag/i);
      await user.selectOptions(refTypeSelect, 'tag');

      await waitFor(() => {
        expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument();
      });
    });

    it('should call onSelectGitRepo and close modal when branch is selected', async() => {
      const user = userEvent.setup({ delay: null });
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();

      // Set up the initial git URL submission
      http.post.mockResolvedValueOnce({
        task_id: 'task-123',
        git_repo_id: 'repo-456',
        new_git_repo: true,
      });
      http.get.mockResolvedValueOnce({
        state: 'Finished',
        success: true,
        git_repo_id: 'repo-456',
        git_branches: ['main', 'develop'],
        git_tags: ['v1.0.0', 'v2.0.0'],
      });

      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} />
      );

      // Submit git URL first
      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Fast-forward timers to trigger polling
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText(/Choose the branch or tag you would like to import/i)).toBeInTheDocument();
      });

      const branchSelect = screen.getByLabelText(/Branches/i);
      await user.selectOptions(branchSelect, 'main');

      const selectButton = screen.getByRole('button', { name: /select/i });
      await user.click(selectButton);

      await waitFor(() => {
        expect(mockOnSelectGitRepo).toHaveBeenCalledWith({
          git_repo_id: 'repo-456',
          git_url: 'https://github.com/test/repo.git',
          git_branch_or_tag: 'main',
          ref_type: 'branch',
        });
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should go back to URL stage when back button is clicked', async() => {
      const user = userEvent.setup({ delay: null });
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();

      http.post.mockResolvedValueOnce({
        task_id: 'task-123',
        git_repo_id: 'repo-456',
        new_git_repo: true,
      });
      http.get.mockResolvedValueOnce({
        state: 'Finished',
        success: true,
        git_repo_id: 'repo-456',
        git_branches: ['main', 'develop'],
        git_tags: ['v1.0.0', 'v2.0.0'],
      });

      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} />
      );

      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText(/Choose the branch or tag you would like to import/i)).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText(/Import Datastore via Git/i)).toBeInTheDocument();
        expect(screen.queryByText(/Choose the branch or tag you would like to import/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Notification', () => {
    it('should allow closing error notification', async() => {
      const user = userEvent.setup({ delay: null });
      const mockOnClose = jest.fn();
      const mockOnSelectGitRepo = jest.fn();

      http.post.mockRejectedValueOnce(new Error('Test error'));

      renderWithRedux(
        <ImportDatastoreViaGitModal isOpen onClose={mockOnClose} onSelectGitRepo={mockOnSelectGitRepo} />
      );

      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Test error/i)).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close notification/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText(/Test error/i)).not.toBeInTheDocument();
      });
    });
  });
});
