import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ReviewGitImport from '../../components/automate-import-export-form/review-git-import';
import { http } from '../../http_api';

jest.mock('../../http_api');

describe('ReviewGitImport component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.miqSparkleOn = jest.fn();
    window.miqSparkleOff = jest.fn();
    window.miqFlashLater = jest.fn();
  });

  const defaultProps = {
    gitRepoId: 'repo-123',
    gitBranchOrTag: 'main',
    refType: 'branch',
    onClose: jest.fn(),
    onImportComplete: jest.fn(),
  };

  it('should render the review section with git information', () => {
    const props = { ...defaultProps, gitUrl: 'https://github.com/test/repo.git' };
    renderWithRedux(<ReviewGitImport {...props} />);

    expect(screen.getByText(/Review Git Import/i)).toBeInTheDocument();
    expect(screen.getByText(/Branch/i)).toBeInTheDocument();
    expect(screen.getByText(/main/i)).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/github\.com\/test\/repo\.git/i)).toBeInTheDocument();
  });

  it('should show tag label when refType is tag', () => {
    const props = {
      ...defaultProps,
      refType: 'tag',
      gitBranchOrTag: 'v1.0.0',
      gitUrl: 'https://github.com/test/repo.git',
    };
    renderWithRedux(<ReviewGitImport {...props} />);

    expect(screen.getByText(/Tag/i)).toBeInTheDocument();
    expect(screen.getByText(/v1\.0\.0/i)).toBeInTheDocument();
  });

  it('should show git repo ID when git URL is not provided', () => {
    renderWithRedux(<ReviewGitImport {...defaultProps} />);

    expect(screen.getByText(/repo-123/i)).toBeInTheDocument();
  });

  it('should call import API when Import button is clicked', async() => {
    const user = userEvent.setup({ delay: null });
    http.post.mockResolvedValueOnce([
      {
        message: 'Imported https://github.com/test/repo.git@main',
        level: 'success',
      },
    ]);

    renderWithRedux(<ReviewGitImport {...defaultProps} />);

    const importButton = screen.getByRole('button', { name: /import/i });
    await user.click(importButton);

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith(
        '/miq_ae_tools/import_via_git',
        expect.objectContaining({
          git_repo_id: 'repo-123',
          git_branch_or_tag: 'main',
          button: 'submit',
        })
      );
    });

    await waitFor(() => {
      expect(window.miqFlashLater).toHaveBeenCalledWith({
        message: 'Imported https://github.com/test/repo.git@main',
        level: 'success',
      });
      expect(defaultProps.onImportComplete).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('should call onClose when Cancel button is clicked', async() => {
    const user = userEvent.setup({ delay: null });
    renderWithRedux(<ReviewGitImport {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should disable import button while importing', async() => {
    const user = userEvent.setup({ delay: null });
    http.post.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRedux(<ReviewGitImport {...defaultProps} />);

    const importButton = screen.getByRole('button', { name: /import/i });
    await user.click(importButton);

    await waitFor(() => {
      expect(importButton).toBeDisabled();
    });
  });
});
