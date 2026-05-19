import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import VmCommonRenameForm from '../../components/vm-common-rename-form';

import '../helpers/miqAjaxButton';

describe('VM common form component', () => {
  let submitSpy;
  beforeEach(() => {
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
  });
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });

  it('should render editing form variant 1', () => {
    const { container } = renderWithRedux(<VmCommonRenameForm />);
    expect(container).toMatchSnapshot();
  });

  it('should render editing form variant 2', async() => {
    const data = {
      action: 'rename',
      new_name: 'Test1',
    };
    fetchMock.getOnce('api/vms/4351', { name: 'CF 4.7  5.10.33 Template' });
    fetchMock.postOnce('/api/vms/4351', data);

    const { container } = renderWithRedux(<VmCommonRenameForm vmId="4351" />);
    await waitFor(() => {
      expect(fetchMock.called('/api/vms/4351')).toBe(true);
    });
    expect(container).toMatchSnapshot();
  });
});
