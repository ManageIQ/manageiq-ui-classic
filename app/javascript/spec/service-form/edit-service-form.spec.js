import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import EditServiceForm from '../../components/edit-service-form';

import '../helpers/miqAjaxButton';

describe('Service form component', () => {
  let initialProps;
  let submitSpy;

  beforeEach(() => {
    initialProps = {
      maxNameLen: 10,
      maxDescLen: 20,
      recordId: 3,
    };
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });

  it('should request data after mount and set to state', async() => {
    fetchMock.getOnce('/api/services/3', {
      foo: 'bar',
    });

    renderWithRedux(<EditServiceForm {...initialProps} />);
    await waitFor(() => {
      expect(fetchMock.lastUrl()).toEqual('/api/services/3');
    });
  });
});
