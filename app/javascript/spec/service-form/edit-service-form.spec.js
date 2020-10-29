import React from 'react';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import EditServiceForm from '../../components/edit-service-form';
import { mount } from '../helpers/mountForm';

require('../helpers/addFlash.js');
require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('Service form component', () => {
  let initialProps;
  let submitSpy;
  let flashSpy;

  beforeEach(() => {
    initialProps = {
      maxNameLen: 10,
      maxDescLen: 20,
      recordId: 3,
    };
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
    flashSpy = jest.spyOn(window, 'add_flash');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });

  it('should request data after mount and set to state', async(done) => {
    fetchMock
      .getOnce('/api/services/3', {
        foo: 'bar',
      });
    await act(async() => {
      mount(<EditServiceForm {...initialProps} />);
    });
    expect(fetchMock.lastUrl()).toEqual('/api/services/3');
    done();
  });
});
