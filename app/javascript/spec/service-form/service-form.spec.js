import React from 'react';
import fetchMock from 'fetch-mock';
import FormRender from '@data-driven-forms/react-form-renderer';
import ServiceForm from '../../components/service-form';
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
      serviceFormId: 3,
    };
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
    flashSpy = jest.spyOn(window, 'add_flash');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });

  it('should request data after mount and set to state', (done) => {
    fetchMock
      .getOnce('/service/service_form_fields/3', {
        foo: 'bar',
      });
    const wrapper = mount(<ServiceForm {...initialProps} />);
    expect(fetchMock.lastUrl()).toEqual('/service/service_form_fields/3');
    setImmediate(() => {
      wrapper.update();
      expect(wrapper.children().state().initialValues).toEqual({ foo: 'bar' });
      done();
    });
  });
});
