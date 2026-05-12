import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReconfigureVmForm from '../../components/reconfigure-vm-form/index';
import {
  valueFromHelpers,
  valueFromHelpersTwo,
  responseDataOne,
  responseDataThree,
  responseDataTwo,
  valueFromHelpersThree,
} from './data';
import { renderWithRedux } from '../helpers/mountForm';

describe('Reconfigure VM form component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render reconfigure form with datatables', async() => {
    fetchMock.get('/vm_infra/reconfigure_form_fields/new,12', responseDataOne);

    const { container } = renderWithRedux(
      <ReconfigureVmForm {...valueFromHelpers} />
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(1);
    expect(container.querySelectorAll('div.disk-table-list')).toHaveLength(1);
    expect(container.querySelectorAll('div.network-table-list')).toHaveLength(
      1
    );
    expect(container).toMatchSnapshot();
  });

  it('should render reconfigure form without datatables', async() => {
    fetchMock.get(
      'vm_infra/reconfigure_form_fields/new,12,13',
      responseDataThree
    );

    const { container } = renderWithRedux(
      <ReconfigureVmForm {...valueFromHelpersTwo} />
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(1);
    expect(container.querySelectorAll('div.disk-table-list')).toHaveLength(0);
    expect(container.querySelectorAll('div.network-table-list')).toHaveLength(
      0
    );
    expect(container).toMatchSnapshot();
  });

  it('should render reconfigure form and show hidden fields', async() => {
    fetchMock.get(
      'vm_infra/reconfigure_form_fields/new,12,13',
      responseDataThree
    );

    const { container } = renderWithRedux(
      <ReconfigureVmForm {...valueFromHelpersTwo} />
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(1);
    expect(container.querySelector('[name="memory"]')).toBeInTheDocument();
    expect(container.querySelector('[name="mem_type"]')).toBeInTheDocument();
    expect(
      container.querySelector('[name="socket_count"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[name="cores_per_socket_count"]')
    ).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render reconfigure form and show disk add form', async() => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12', responseDataOne);
    const user = userEvent.setup();

    const { container } = renderWithRedux(
      <ReconfigureVmForm {...valueFromHelpers} />
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    const diskAddButton = container.querySelector('button.disk-add');
    await user.click(diskAddButton);

    expect(fetchMock.calls()).toHaveLength(1);
    expect(container.querySelector('[name="type"]')).toBeInTheDocument();
    expect(container.querySelector('[name="size"]')).toBeInTheDocument();
    expect(container.querySelector('[name="unit"]')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render reconfigure form and show network add form', async() => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12', responseDataOne);
    const user = userEvent.setup();

    const { container } = renderWithRedux(
      <ReconfigureVmForm {...valueFromHelpers} />
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    const networkAddButton = container.querySelector('button.network-add');
    await user.click(networkAddButton);

    expect(fetchMock.calls()).toHaveLength(1);
    expect(container.querySelector('[name="vlan"]')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render reconfigure form and show cd rom connect form', async() => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12', responseDataTwo);
    const user = userEvent.setup();

    const { container } = renderWithRedux(
      <ReconfigureVmForm {...valueFromHelpers} />
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    // Find and click the Disconnect button
    const disconnectButtons = screen.getAllByRole('button', {
      name: /disconnect/i,
    });
    const disconnectButton = disconnectButtons.find((btn) =>
      btn.classList.contains('miq-data-table-button'));
    expect(disconnectButton).not.toBeDisabled();
    await user.click(disconnectButton);

    // After disconnect, verify Cancel Disconnect button appears
    await waitFor(() => {
      const cancelDisconnectButtons = screen.getAllByRole('button', {
        name: /cancel disconnect/i,
      });
      const cancelDisconnectButton = cancelDisconnectButtons.find((btn) =>
        btn.classList.contains('miq-data-table-button'));
      expect(cancelDisconnectButton).toBeInTheDocument();
    });

    // Verify Connect button
    const connectButtons = screen.getAllByRole('button', {
      name: /^connect$/i,
    });
    const connectButton = connectButtons.find((btn) =>
      btn.classList.contains('miq-data-table-button'));
    expect(connectButton).not.toBeDisabled();
    await user.click(connectButton);

    expect(screen.getByText('Host File')).toBeInTheDocument();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(container).toMatchSnapshot();
  });

  it('should render reconfigure form and show disk resize form', async() => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12', responseDataTwo);
    const user = userEvent.setup();

    const { container } = renderWithRedux(
      <ReconfigureVmForm {...valueFromHelpers} />
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    const resizeButtons = screen.getAllByRole('button', { name: /resize/i });
    const resizeButton = resizeButtons.find((btn) =>
      btn.classList.contains('miq-data-table-button'));
    await user.click(resizeButton);

    expect(fetchMock.calls()).toHaveLength(1);
    expect(container.querySelector('[name="size"]')).toBeInTheDocument();
    expect(container.querySelector('[name="unit"]')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render reconfigure sub form and click delete button', async() => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12', responseDataTwo);
    const user = userEvent.setup();

    const { container } = renderWithRedux(
      <ReconfigureVmForm {...valueFromHelpers} />
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    const deleteButton = deleteButtons.find((btn) =>
      btn.classList.contains('miq-data-table-button'));
    await user.click(deleteButton);

    expect(fetchMock.calls()).toHaveLength(1);
    const cancelDeleteButton = screen.getByRole('button', {
      name: /cancel delete/i,
    });
    expect(cancelDeleteButton).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render reconfigure form and click cd-rom disconnect button', async() => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12', responseDataTwo);
    const user = userEvent.setup();

    const { container } = renderWithRedux(
      <ReconfigureVmForm {...valueFromHelpers} />
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    const disconnectButtons = screen.getAllByRole('button', {
      name: /disconnect/i,
    });
    const disconnectButton = disconnectButtons.find((btn) =>
      btn.classList.contains('miq-data-table-button'));
    await user.click(disconnectButton);

    expect(fetchMock.calls()).toHaveLength(1);
    const cancelDisconnectButtons = screen.getAllByRole('button', {
      name: /cancel disconnect/i,
    });
    const cancelDisconnectButton = cancelDisconnectButtons.find((btn) =>
      btn.classList.contains('miq-data-table-button'));
    expect(cancelDisconnectButton).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render form with only fields it has permission for', async() => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12', responseDataOne);

    const { container } = renderWithRedux(
      <ReconfigureVmForm {...valueFromHelpersThree} />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(1);
    expect(screen.getByText('Memory')).toBeInTheDocument();
    expect(screen.queryByText('Processor')).not.toBeInTheDocument();
    expect(screen.queryByText('Disks')).not.toBeInTheDocument();
    expect(screen.queryByText('Network Adapters')).not.toBeInTheDocument();
    expect(screen.getByText('CD/DVD Drives')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
