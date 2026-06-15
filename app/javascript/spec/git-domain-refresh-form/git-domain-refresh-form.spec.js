import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

import GitDomainRefreshForm from '../../components/git-domain-refresh-form';
import { renderWithRedux } from '../helpers/mountForm';

import miqRedirectBack from '../../helpers/miq-redirect-back';
import '../helpers/miqSparkle';

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

describe('GitDomainRefreshForm component', () => {
  let initialProps;
  let submitSpyMiqSparkleOn;

  beforeEach(() => {
    initialProps = {
      domainId: '123',
      gitRepoId: '789',
      branchNames: ['origin/main', 'origin/develop', 'origin/feature/test'],
      tagNames: ['v1.0.0', 'v1.1.0', 'v2.0.0'],
      refType: 'branch',
      refName: 'origin/main',
    };

    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpyMiqSparkleOn.mockRestore();
  });

  it('should render correctly', () => {
    const { container } = renderWithRedux(<GitDomainRefreshForm {...initialProps} />);
    expect(container).toMatchSnapshot();
  });

  it('should render with branch as default ref_type', async() => {
    renderWithRedux(<GitDomainRefreshForm {...initialProps} />);

    await waitFor(() => {
      const refTypeSelect = screen.getByLabelText(/branch\/tag/i);
      expect(refTypeSelect).toHaveValue('branch');
    });
  });

  it('should render branch select when ref_type is branch', async() => {
    renderWithRedux(<GitDomainRefreshForm {...initialProps} />);

    await waitFor(() => {
      const branchSelect = screen.getByLabelText(/branches/i);
      expect(branchSelect).toBeInTheDocument();
    });
  });

  it('should render tag select when ref_type is tag', async() => {
    const user = userEvent.setup();
    renderWithRedux(<GitDomainRefreshForm {...initialProps} />);

    const refTypeSelect = screen.getByLabelText(/branch\/tag/i);
    await user.selectOptions(refTypeSelect, 'tag');

    await waitFor(() => {
      const tagSelect = screen.getByLabelText(/tags/i);
      expect(tagSelect).toBeInTheDocument();
    });
  });

  it('should have correct branch options', async() => {
    renderWithRedux(<GitDomainRefreshForm {...initialProps} />);

    await waitFor(() => {
      const branchSelect = screen.getByLabelText(/branches/i);
      const options = Array.from(branchSelect.options).map((opt) => opt.text);

      expect(options).toContain('origin/main');
      expect(options).toContain('origin/develop');
      expect(options).toContain('origin/feature/test');
    });
  });

  it('should have correct tag options', async() => {
    const user = userEvent.setup();
    renderWithRedux(<GitDomainRefreshForm {...initialProps} />);

    const refTypeSelect = screen.getByLabelText(/branch\/tag/i);
    await user.selectOptions(refTypeSelect, 'tag');

    await waitFor(() => {
      const tagSelect = screen.getByLabelText(/tags/i);
      const options = Array.from(tagSelect.options).map((opt) => opt.text);

      expect(options).toContain('v1.0.0');
      expect(options).toContain('v1.1.0');
      expect(options).toContain('v2.0.0');
    });
  });

  it('should render Save and Cancel buttons', () => {
    renderWithRedux(<GitDomainRefreshForm {...initialProps} />);

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should set initial branch value to current branch', async() => {
    renderWithRedux(<GitDomainRefreshForm {...initialProps} />);

    await waitFor(() => {
      const branchSelect = screen.getByLabelText(/branches/i);
      expect(branchSelect).toHaveValue('origin/main');
    });
  });

  it('should call correct API endpoint on submit with branch', async() => {
    const user = userEvent.setup();

    API.post = jest.fn().mockResolvedValue({
      task_id: '123',
      success: true,
      message: 'Refreshing Automate Domain',
    });

    API.wait_for_task = jest.fn().mockResolvedValue({
      state: 'Finished',
      status: 'Ok',
    });

    renderWithRedux(<GitDomainRefreshForm {...initialProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/branches/i)).toBeInTheDocument();
    });

    const branchSelect = screen.getByLabelText(/branches/i);
    await user.selectOptions(branchSelect, 'origin/develop');

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        '/api/automate_domains/123',
        expect.objectContaining({
          action: 'refresh_from_source',
          resource: {
            ref_type: 'branch',
            ref: 'origin/develop',
          },
        }),
        { skipErrors: [400] }
      );
    });

    await waitFor(() => {
      expect(API.wait_for_task).toHaveBeenCalledWith('123');
    });

    expect(miqSparkleOn).toHaveBeenCalled();
    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Refreshing Automate Domain',
      'success',
      '/miq_ae_class/explorer'
    );
  });

  it('should call correct API endpoint on submit with tag', async() => {
    const user = userEvent.setup();

    API.post = jest.fn().mockResolvedValue({
      task_id: '456',
      success: true,
      message: 'Refreshing Automate Domain',
    });

    API.wait_for_task = jest.fn().mockResolvedValue({
      state: 'Finished',
      status: 'Ok',
    });

    renderWithRedux(<GitDomainRefreshForm {...initialProps} />);

    const refTypeSelect = screen.getByLabelText(/branch\/tag/i);
    await user.selectOptions(refTypeSelect, 'tag');

    await waitFor(() => {
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    });

    const tagSelect = screen.getByLabelText(/tags/i);
    await user.selectOptions(tagSelect, 'v2.0.0');

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        '/api/automate_domains/123',
        expect.objectContaining({
          action: 'refresh_from_source',
          resource: {
            ref_type: 'tag',
            ref: 'v2.0.0',
          },
        }),
        { skipErrors: [400] }
      );
    });

    await waitFor(() => {
      expect(API.wait_for_task).toHaveBeenCalledWith('456');
    });

    expect(miqSparkleOn).toHaveBeenCalled();
    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Refreshing Automate Domain',
      'success',
      '/miq_ae_class/explorer'
    );
  });

  it('should redirect back on cancel', async() => {
    const user = userEvent.setup();
    window.__ = jest.fn((str) => str);

    renderWithRedux(<GitDomainRefreshForm {...initialProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(miqRedirectBack).toHaveBeenCalledWith(
        expect.stringContaining('canceled'),
        'warning',
        '/miq_ae_class/explorer'
      );
    });
  });

  it('should default to first branch if refName not provided', async() => {
    const propsWithoutRefName = {
      ...initialProps,
      refName: '',
    };

    renderWithRedux(<GitDomainRefreshForm {...propsWithoutRefName} />);

    await waitFor(() => {
      const branchSelect = screen.getByLabelText(/branches/i);
      expect(branchSelect).toHaveValue('origin/main');
    });
  });
});
