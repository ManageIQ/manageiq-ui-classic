import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import HostAggregateForm from '../../components/host-aggregate-form';
import AddRemoveHostAggregateForm from '../../components/host-aggregate-form/add-remove-host-aggregate-form';
import { renderWithRedux } from '../helpers/mountForm';
import miqRedirectBack from '../../helpers/miq-redirect-back';

import '../helpers/miqSparkle';

describe('Host aggregate form component', () => {
  const emsList = {
    resources: [
      { name: 'name1', id: 1 },
      { name: 'name2', id: 2 },
    ],
  };

  beforeEach(() => {
    fetchMock.mock(
      '/api/providers?expand=resources&attributes=id,name,supports_create_host_aggregate&filter[]=supports_create_host_aggregate=true',
      emsList
    );
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    jest.clearAllMocks();
  });

  const values = {
    name: 'key1',
    availability_zone: 1,
    ems_id: 2,
  };

  it('should render adding form variant', async() => {
    const { container } = renderWithRedux(<HostAggregateForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render editing form variant', async() => {
    fetchMock.getOnce('/api/host_aggregates/1', values);

    const { container } = renderWithRedux(<HostAggregateForm recordId="1" />);

    await waitFor(() => {
      expect(fetchMock.called('/api/host_aggregates/1')).toBe(true);
    });

    expect(container).toMatchSnapshot();
  });

  it('should call miqRedirectBack when canceling create form', async() => {
    const user = userEvent.setup();

    renderWithRedux(<HostAggregateForm />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Creation of new Host Aggregate was canceled by the user.',
      'warning',
      '/host_aggregate/show_list'
    );
  });

  it('should render add host form', async() => {
    const { container } = renderWithRedux(<AddRemoveHostAggregateForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render add host form variant (remvove host)', async() => {
    const { container } = renderWithRedux(
      <AddRemoveHostAggregateForm isAdd={false} />
    );

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should call miqRedirectBack when canceling add host form', async() => {
    const user = userEvent.setup();

    renderWithRedux(<AddRemoveHostAggregateForm />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Addition of Host was cancelled by the user.',
      'warning',
      '/host_aggregate/show_list'
    );
  });

  it('should call miqRedirectBack when canceling remove host form', async() => {
    const user = userEvent.setup();

    renderWithRedux(<AddRemoveHostAggregateForm isAdd={false} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Removal of Host was cancelled by the user.',
      'warning',
      '/host_aggregate/show_list'
    );
  });
});
