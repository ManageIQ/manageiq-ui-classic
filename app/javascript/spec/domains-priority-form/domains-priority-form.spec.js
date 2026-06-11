import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

import DomainsPriorityForm from '../../components/domains-priority-form';
import { renderWithRedux } from '../helpers/mountForm';
import { http } from '../../http_api';

import miqRedirectBack from '../../helpers/miq-redirect-back';
import '../helpers/miqSparkle';

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());
jest.mock('../../http_api');

describe('DomainsPriorityForm component', () => {
  let initialProps;
  let submitSpyMiqSparkleOn;

  beforeEach(() => {
    initialProps = {
      domainOrder: [
        'ManageIQ',
        'RedHat',
        'CustomDomain',
        'TestDomain (Locked)',
      ],
    };

    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpyMiqSparkleOn.mockRestore();
  });

  it('should render correctly', () => {
    const { container } = renderWithRedux(<DomainsPriorityForm {...initialProps} />);
    expect(container).toMatchSnapshot();
  });

  it('should render all domains in the list', async() => {
    renderWithRedux(<DomainsPriorityForm {...initialProps} />);

    await waitFor(() => {
      expect(screen.getByText('ManageIQ')).toBeInTheDocument();
      expect(screen.getByText('RedHat')).toBeInTheDocument();
      expect(screen.getByText('CustomDomain')).toBeInTheDocument();
      expect(screen.getByText('TestDomain (Locked)')).toBeInTheDocument();
    });
  });

  it('should render Save, Reset, and Cancel buttons', () => {
    renderWithRedux(<DomainsPriorityForm {...initialProps} />);

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should reset form to initial values when Reset is clicked', async() => {
    const user = userEvent.setup();
    renderWithRedux(<DomainsPriorityForm {...initialProps} />);

    // Get the first domain item
    const firstItem = screen.getByLabelText(/ManageIQ.*Press arrow keys/i);

    // Simulate keyboard reordering (move first item down)
    await user.click(firstItem);
    await user.keyboard('{ArrowDown}');

    // Verify order changed - get all draggable items
    const items = screen.getAllByRole('button', { name: /Press arrow keys to reorder/i });
    expect(items[0]).toHaveAccessibleName(/RedHat.*Press arrow keys/i);
    expect(items[1]).toHaveAccessibleName(/ManageIQ.*Press arrow keys/i);

    // Click Reset button
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    // Verify order is restored to initial
    const resetItems = screen.getAllByRole('button', { name: /Press arrow keys to reorder/i });
    expect(resetItems[0]).toHaveAccessibleName(/ManageIQ.*Press arrow keys/i);
    expect(resetItems[1]).toHaveAccessibleName(/RedHat.*Press arrow keys/i);
  });

  it('should display domains label', async() => {
    renderWithRedux(<DomainsPriorityForm {...initialProps} />);

    await waitFor(() => {
      expect(screen.getByText(/domains:/i)).toBeInTheDocument();
    });
  });

  it('should call correct API endpoint on submit', async() => {
    const user = userEvent.setup();

    http.post = jest.fn().mockResolvedValue({
      message: 'Priority Order was saved',
      level: 'success',
    });

    renderWithRedux(<DomainsPriorityForm {...initialProps} />);

    // Simulate a reorder by pressing ArrowDown on the first item to make form dirty
    const firstItem = screen.getByLabelText(/ManageIQ.*Press arrow keys/i);
    firstItem.focus();
    await user.keyboard('{ArrowDown}');

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith(
        '/miq_ae_class/domains_priority_edit',
        expect.objectContaining({
          button: 'save',
        }),
        { skipErrors: [400] }
      );
    });

    expect(miqSparkleOn).toHaveBeenCalled();
    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Priority Order was saved',
      'success',
      '/miq_ae_class/explorer'
    );
  });

  it('should reverse domain order before submitting', async() => {
    const user = userEvent.setup();

    http.post = jest.fn().mockResolvedValue({
      message: 'Priority Order was saved',
      level: 'success',
    });

    renderWithRedux(<DomainsPriorityForm {...initialProps} />);

    // Simulate a reorder by pressing ArrowDown on the first item to make form dirty
    const firstItem = screen.getByLabelText(/ManageIQ.*Press arrow keys/i);
    firstItem.focus();
    await user.keyboard('{ArrowDown}');

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(http.post).toHaveBeenCalled();
      const callArgs = http.post.mock.calls[0][1];
      // After moving ManageIQ down, the order is: RedHat, ManageIQ, CustomDomain, TestDomain (Locked)
      // When reversed for backend: TestDomain (Locked), CustomDomain, ManageIQ, RedHat
      expect(callArgs.domain_order[0]).toBe('TestDomain (Locked)');
      expect(callArgs.domain_order[callArgs.domain_order.length - 1]).toBe('RedHat');
    });
  });

  it('should handle API error on submit', async() => {
    const user = userEvent.setup();

    http.post = jest.fn().mockRejectedValue({
      data: {
        message: 'Error saving priority order',
        level: 'error',
      },
      message: 'Error saving priority order',
    });

    renderWithRedux(<DomainsPriorityForm {...initialProps} />);

    // Simulate a reorder by pressing ArrowDown on the first item to make form dirty
    const firstItem = screen.getByLabelText(/ManageIQ.*Press arrow keys/i);
    firstItem.focus();
    await user.keyboard('{ArrowDown}');

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(miqRedirectBack).toHaveBeenCalledWith(
        'Error saving priority order',
        'error',
        '/miq_ae_class/explorer'
      );
    });
  });

  it('should redirect back on cancel', async() => {
    const user = userEvent.setup();
    window.__ = jest.fn((str) => str);

    renderWithRedux(<DomainsPriorityForm {...initialProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(miqRedirectBack).toHaveBeenCalledWith(
        expect.stringContaining('cancelled'),
        'warning',
        '/miq_ae_class/explorer'
      );
    });
  });

  it('should handle empty domain list', () => {
    const emptyProps = {
      domainOrder: [],
    };

    renderWithRedux(<DomainsPriorityForm {...emptyProps} />);

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should preserve locked domain suffix in submission', async() => {
    const user = userEvent.setup();

    http.post = jest.fn().mockResolvedValue({
      message: 'Priority Order was saved',
      level: 'success',
    });

    renderWithRedux(<DomainsPriorityForm {...initialProps} />);

    // Simulate a reorder by pressing ArrowDown on the first item to make form dirty
    const firstItem = screen.getByLabelText(/ManageIQ.*Press arrow keys/i);
    firstItem.focus();
    await user.keyboard('{ArrowDown}');

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(http.post).toHaveBeenCalled();
      const callArgs = http.post.mock.calls[0][1];
      // Check that locked suffix is preserved
      expect(callArgs.domain_order).toContain('TestDomain (Locked)');
    });
  });
});
