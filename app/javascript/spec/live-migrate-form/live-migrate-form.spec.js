import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import LiveMigrateForm from '../../components/live-migrate-form/index';
import { renderWithRedux } from '../helpers/mountForm';
import { hosts } from './data';

require('../helpers/miqSparkle');

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

describe('Live Migrate form component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render live migrate form with host options', async() => {
    fetchMock.getOnce('/vm_cloud/live_migrate_form_fields/20', { hosts });

    const { container } = renderWithRedux(<LiveMigrateForm recordId="20" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(1);

    const autoSelectInput = container.querySelector('input[name="auto_select_host"]');
    expect(autoSelectInput).toBeInTheDocument();
    expect(autoSelectInput.disabled).toBe(false);

    expect(container).toMatchSnapshot();
  });

  it('should render live migrate form when hosts empty', async() => {
    const hosts = [];
    fetchMock.getOnce('/vm_cloud/live_migrate_form_fields/20', { hosts });

    const { container } = renderWithRedux(<LiveMigrateForm recordId="20" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(1);
    expect(container.querySelector('destination_host')).not.toBeInTheDocument();

    const autoSelectInput = container.querySelector('input[name="auto_select_host"]');
    expect(autoSelectInput).toBeInTheDocument();
    expect(autoSelectInput.disabled).toBe(true);

    expect(container).toMatchSnapshot();
  });

  it('should render live migrate form with multiple instances', async() => {
    const { container } = renderWithRedux(<LiveMigrateForm recordId="" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(0);
    expect(container.querySelector('destination_host')).not.toBeInTheDocument();

    const autoSelectInput = container.querySelector('input[name="auto_select_host"]');
    expect(autoSelectInput).toBeInTheDocument();
    expect(autoSelectInput.disabled).toBe(true);

    expect(container).toMatchSnapshot();
  });
});
