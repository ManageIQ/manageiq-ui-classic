import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import EvacuateForm from '../../components/evacuate-form/index';
import { hosts } from './data';
import { renderWithRedux } from '../helpers/mountForm';

describe('evacuate form component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render evacuate form with host options', async() => {
    fetchMock.getOnce('/vm_cloud/evacuate_form_fields/40', { hosts });

    const { container } = renderWithRedux(<EvacuateForm recordId="40" />);

    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(1);
    });

    const autoSelectHostInput = container.querySelector(
      'input[name="auto_select_host"]'
    );
    expect(autoSelectHostInput).toBeInTheDocument();
    expect(autoSelectHostInput.disabled).toBe(false);
    expect(container).toMatchSnapshot();
  });

  it('should render evacuate form when hosts empty', async() => {
    const hosts = [];
    fetchMock.getOnce('/vm_cloud/evacuate_form_fields/40', { hosts });

    const { container } = renderWithRedux(<EvacuateForm recordId="40" />);

    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(1);
    });

    expect(
      container.querySelector('[name="destination_host"]')
    ).not.toBeInTheDocument();

    const autoSelectHostInput = container.querySelector(
      'input[name="auto_select_host"]'
    );
    expect(autoSelectHostInput).toBeInTheDocument();
    expect(autoSelectHostInput.disabled).toBe(true);
    expect(container).toMatchSnapshot();
  });

  it('should render evacuate form with multiple instances', async() => {
    const { container } = renderWithRedux(<EvacuateForm recordId="" />);

    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(0);
    });

    expect(
      container.querySelector('[name="destination_host"]')
    ).not.toBeInTheDocument();
    const autoSelectHostInput = container.querySelector(
      'input[name="auto_select_host"]'
    );
    expect(autoSelectHostInput).toBeInTheDocument();
    expect(autoSelectHostInput.disabled).toBe(true);

    const onSharedStorageInput = container.querySelector(
      'input[name="on_shared_storage"]'
    );
    expect(onSharedStorageInput).toBeInTheDocument();
    expect(onSharedStorageInput.checked).toBe(true);
    expect(container).toMatchSnapshot();
  });
});
