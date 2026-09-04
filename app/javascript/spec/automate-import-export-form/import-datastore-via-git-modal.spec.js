import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ImportDatastoreViaGitModal from '../../components/automate-import-export-form/import-datastore-via-git-modal';
import { http } from '../../http_api';

jest.mock('../../http_api');

const defaultPostResponse = {
  task_id: 'task-123',
  git_repo_id: 'repo-456',
  new_git_repo: true,
};

const defaultGetResponse = {
  state: 'Finished',
  success: true,
  git_repo_id: 'repo-456',
  git_branches: ['main', 'develop'],
  git_tags: ['v1.0.0', 'v2.0.0'],
};

const renderModal = (props = {}) => {
  const mockOnClose = jest.fn();
  const mockOnSelectGitRepo = jest.fn();
  renderWithRedux(
    <ImportDatastoreViaGitModal
      isOpen
      onClose={mockOnClose}
      onSelectGitRepo={mockOnSelectGitRepo}
      {...props}
    />
  );
  return { mockOnClose, mockOnSelectGitRepo };
};

const advanceToBranchTagStage = async(user) => {
  const input = screen.getByLabelText(/Git URL/i);
  await user.type(input, 'https://github.com/test/repo.git');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  await act(async() => {
    jest.advanceTimersByTime(2000);
  });
  await waitFor(() => {
    expect(screen.getByText(/Choose the branch or tag/i)).toBeInTheDocument();
  });
};

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

  describe('Stage 1: Git URL Form', () => {
    it('should render the git URL form initially', () => {
      renderModal();

      expect(screen.getByLabelText(/Git URL/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Verify Peer Certificate/i)).toBeInTheDocument();
    });

    it('should have submit button disabled when form is invalid', () => {
      renderModal();
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toBeDisabled();
    });

    it('should enable submit button when valid URL is entered', async() => {
      const user = userEvent.setup({ delay: null });
      renderModal();

      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /submit/i });
        expect(button).not.toBeDisabled();
      });
    });

    it('should show disabled message when disableSubmit prop is true', () => {
      renderModal({ disableSubmit: true });

      expect(screen.getByText(/Please enable the git owner role/i)).toBeInTheDocument();
    });

    it('should keep submit button disabled when disableSubmit is true', async() => {
      const user = userEvent.setup({ delay: null });
      renderModal({ disableSubmit: true });

      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');

      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toBeDisabled();
    });
  });

  describe('Stage 2: Task Polling and Branch/Tag Selection', () => {
    it('should show loading indicator after git URL submission', async() => {
      const user = userEvent.setup({ delay: null });

      http.post.mockResolvedValueOnce(defaultPostResponse);
      http.get.mockResolvedValueOnce({ state: 'Active' });

      renderModal();

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
        expect(http.get).toHaveBeenCalledWith(
          '/miq_ae_tools/check_git_task?task_id=task-123&git_repo_id=repo-456&new_git_repo=true'
        );
      });
    });

    it('should show success notification and branch/tag selection form when task completes', async() => {
      const user = userEvent.setup({ delay: null });

      http.post.mockResolvedValueOnce(defaultPostResponse);
      http.get.mockResolvedValueOnce(defaultGetResponse);

      renderModal();

      await advanceToBranchTagStage(user);

      expect(screen.getByLabelText(/Branch\/Tag/i)).toBeInTheDocument();
    });

    it('should show error notification when http.post fails', async() => {
      const user = userEvent.setup({ delay: null });

      http.post.mockRejectedValueOnce(new Error('Network error'));

      renderModal();

      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });

      // Should remain on the URL stage
      expect(screen.getByLabelText(/Git URL/i)).toBeInTheDocument();
    });

    it('should show error notification when polling returns success: false', async() => {
      const user = userEvent.setup({ delay: null });

      http.post.mockResolvedValueOnce(defaultPostResponse);
      http.get.mockResolvedValueOnce({
        state: 'Finished',
        success: false,
        message: { message: 'Repository not found' },
      });

      renderModal();

      const input = screen.getByLabelText(/Git URL/i);
      await user.type(input, 'https://github.com/test/repo.git');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await act(async() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText(/Repository not found/i)).toBeInTheDocument();
      });

      // Should remain on the URL stage
      expect(screen.getByLabelText(/Git URL/i)).toBeInTheDocument();
    });
  });

  describe('Branch/Tag Selection and Import', () => {
    it('should show branches by default', async() => {
      const user = userEvent.setup({ delay: null });

      http.post.mockResolvedValueOnce(defaultPostResponse);
      http.get.mockResolvedValueOnce(defaultGetResponse);

      renderModal();

      await advanceToBranchTagStage(user);

      await waitFor(() => {
        expect(screen.getByLabelText(/Branches/i)).toBeInTheDocument();
      });
    });

    it('should switch to tags when tag option is selected', async() => {
      const user = userEvent.setup({ delay: null });

      http.post.mockResolvedValueOnce(defaultPostResponse);
      http.get.mockResolvedValueOnce(defaultGetResponse);

      renderModal();

      await advanceToBranchTagStage(user);

      const refTypeSelect = screen.getByLabelText(/Branch\/Tag/i);
      await user.selectOptions(refTypeSelect, 'tag');

      await waitFor(() => {
        expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument();
      });
    });

    it('should call onSelectGitRepo when branch is selected', async() => {
      const user = userEvent.setup({ delay: null });

      http.post.mockResolvedValueOnce(defaultPostResponse);
      http.get.mockResolvedValueOnce(defaultGetResponse);

      const { mockOnSelectGitRepo } = renderModal();

      await advanceToBranchTagStage(user);

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
    });

    it('should go back to URL stage when back button is clicked', async() => {
      const user = userEvent.setup({ delay: null });

      http.post.mockResolvedValueOnce(defaultPostResponse);
      http.get.mockResolvedValueOnce(defaultGetResponse);

      renderModal();

      await advanceToBranchTagStage(user);

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText(/Import Datastore via Git/i)).toBeInTheDocument();
        expect(screen.queryByText(/Choose the branch or tag/i)).not.toBeInTheDocument();
      });
    });
  });
});
