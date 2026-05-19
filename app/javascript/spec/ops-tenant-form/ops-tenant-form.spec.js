import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import OpsTenantForm from '../../components/ops-tenant-form/ops-tenant-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';

import '../helpers/miqSparkle';
import '../helpers/miqFlashLater';

describe('OpstTenantForm', () => {
  let initialProps;
  const sparkleOnSpy = jest.spyOn(window, 'miqSparkleOn');
  const sparkleOffSpy = jest.spyOn(window, 'miqSparkleOff');
  const flashSpy = jest.spyOn(window, 'add_flash');
  const flashLaterSpy = jest.spyOn(window, 'miqFlashLater');

  beforeEach(() => {
    initialProps = {
      recordId: null,
      divisible: false,
      ancestry: null,
      redirectUrl: '/foo/bar',
    };
  });

  afterEach(() => {
    fetchMock.reset();
    sparkleOnSpy.mockReset();
    sparkleOffSpy.mockReset();
    flashSpy.mockReset();
    flashLaterSpy.mockReset();
  });

  it('should mount form without initialValues', async() => {
    fetchMock.getOnce(
      `/api/tenants/${initialProps.recordId}?expand=resources&attributes=name,description,ancestry,divisible`,
      {
        name: 'foo',
      }
    );
    renderWithRedux(<OpsTenantForm {...initialProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Name/i)).toHaveValue('');
    expect(fetchMock.calls().length).toEqual(0);
    expect(sparkleOnSpy).not.toHaveBeenCalled();
    expect(sparkleOffSpy).not.toHaveBeenCalled();
  });

  it('should mount and set initialValues', async() => {
    fetchMock.getOnce(
      '/api/tenants/123?expand=resources&attributes=name,description,ancestry,divisible',
      {
        name: 'foo',
      }
    );
    renderWithRedux(<OpsTenantForm {...initialProps} recordId={123} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Name/i)).toHaveValue('foo');
    expect(fetchMock.calls()).toHaveLength(1);
    expect(sparkleOnSpy).toHaveBeenCalled();
    expect(sparkleOffSpy).toHaveBeenCalled();
  });

  it('should call miqRedirectBack when canceling form', async() => {
    const user = userEvent.setup();
    fetchMock.getOnce('/api/tenants?filter[]=name=&expand=resources', {
      resources: [],
    });
    renderWithRedux(<OpsTenantForm {...initialProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Creation of new Project was canceled by the user.',
      'warning',
      '/foo/bar'
    );
  });

  it('should correctly add new entity.', async() => {
    const user = userEvent.setup();
    fetchMock.getOnce('/api/tenants?filter[]=name=foo&expand=resources', {
      resources: [],
    });
    fetchMock.postOnce('/api/tenants', {});
    const { container } = renderWithRedux(<OpsTenantForm {...initialProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    });
    const nameInput = screen.getByLabelText(/Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    await user.type(nameInput, 'foo');
    await user.type(descriptionInput, 'bar');

    let submitButton;
    await waitFor(() => {
      submitButton = container.querySelector('button.cds--btn--primary');
      expect(submitButton).not.toBeDisabled();
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(fetchMock.called('/api/tenants')).toBe(true);
    });
    expect(JSON.parse(fetchMock.calls()[1][1].body)).toEqual({
      name: 'foo',
      description: 'bar',
      divisible: false,
      parent: { id: null },
    });
    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Project "foo" has been successfully added.',
      'success',
      '/foo/bar'
    );
  });

  it('should correctly edit existing entity.', async() => {
    const user = userEvent.setup();
    fetchMock.getOnce(
      '/api/tenants/123?expand=resources&attributes=name,description,ancestry,divisible',
      {
        name: 'foo',
        description: 'bar',
        ancestry: null,
        divisible: false,
      }
    );
    fetchMock.getOnce('/api/tenants?filter[]=name=foo&expand=resources', {
      resources: [],
    });
    fetchMock.putOnce('/api/tenants/123', {});
    const { container } = renderWithRedux(
      <OpsTenantForm {...initialProps} recordId={123} />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    });
    const descriptionInput = screen.getByLabelText(/Description/i);
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'desc');

    let submitButton;
    await waitFor(() => {
      submitButton = container.querySelector('button.cds--btn--primary');
      expect(submitButton).not.toBeDisabled();
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(fetchMock.called('/api/tenants/123')).toBe(true);
    });
    expect(JSON.parse(fetchMock.calls()[2][1].body)).toEqual({
      name: 'foo',
      description: 'desc',
      divisible: false,
    });
    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Project "foo" has been successfully saved.',
      'success',
      '/foo/bar'
    );
  });
});
