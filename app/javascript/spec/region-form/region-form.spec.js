import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import RegionForm from '../../components/region-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import '../helpers/miqSparkle';
import '../helpers/miqFlashLater';

describe('RegionForm', () => {
  let initialProps;
  const sparkleOnSpy = jest.spyOn(window, 'miqSparkleOn');
  const sparkleOffSpy = jest.spyOn(window, 'miqSparkleOff');
  const flashSpy = jest.spyOn(window, 'add_flash');
  const flashLaterSpy = jest.spyOn(window, 'miqFlashLater');

  beforeEach(() => {
    initialProps = {
      id: '123',
      maxDescLen: 50,
    };
  });

  afterEach(() => {
    fetchMock.reset();
    sparkleOnSpy.mockReset();
    sparkleOffSpy.mockReset();
    flashSpy.mockReset();
    flashLaterSpy.mockReset();
  });

  it('should mount and set initialValues', async() => {
    fetchMock.getOnce('/api/regions/123?attributes=description', {
      description: 'foo',
    });
    renderWithRedux(<RegionForm {...initialProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Description/i)).toHaveValue('foo');
    expect(fetchMock.calls()).toHaveLength(1);
    expect(sparkleOnSpy).toHaveBeenCalled();
    expect(sparkleOffSpy).toHaveBeenCalled();
  });

  it('should successfully call cancel', async() => {
    const user = userEvent.setup();
    fetchMock.getOnce('/api/regions/123?attributes=description', {
      description: 'foo',
    });
    renderWithRedux(<RegionForm {...initialProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Edit of Region was cancelled by the user',
      'success',
      '/ops/explorer/?button=cancel'
    );
  });

  it('should call addFlash when resetting edit form', async() => {
    const user = userEvent.setup();
    fetchMock.getOnce('/api/regions/123?attributes=description', {
      description: 'foo',
    });
    renderWithRedux(<RegionForm {...initialProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });
    const descriptionInput = screen.getByLabelText(/Description/i);
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'bar');
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    await user.click(resetButton);
    expect(flashSpy).toHaveBeenCalledWith(
      'All changes have been reset',
      'warn'
    );
  });

  it('should enable submit button and call submit callback', async() => {
    const user = userEvent.setup();
    fetchMock
      .getOnce('/api/regions/123?attributes=description', {
        description: 'foo',
      })
      .postOnce('/api/regions/123', {});
    const { container } = renderWithRedux(<RegionForm {...initialProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });
    const descriptionInput = screen.getByLabelText(/Description/i);
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'bar');
    let submitButton;
    await waitFor(() => {
      submitButton = container.querySelector('button.cds--btn--primary');
      expect(submitButton).not.toBeDisabled();
    });
    await user.click(submitButton);
    await waitFor(() => {
      expect(fetchMock.called('/api/regions/123')).toBe(true);
    });
    expect(JSON.parse(fetchMock.calls()[1][1].body)).toEqual({
      action: 'edit',
      resource: {
        description: 'bar',
      },
    });

    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Region was saved',
      'success',
      '/ops/explorer/123?button=save'
    );
  });
});
