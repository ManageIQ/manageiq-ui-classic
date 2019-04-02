import React from 'react';
import { mount } from 'enzyme';
import fetchMock from 'fetch-mock';
import FormRender from '@data-driven-forms/react-form-renderer';
import ServiceForm from '../../components/service-form';

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
      expect(wrapper.state().initialValues).toEqual({ foo: 'bar' });
      done();
    });
  });

  it('should call cancel action', (done) => {
    fetchMock
      .getOnce('/service/service_form_fields/3', {
        name: 'foo',
        description: 'bar',
      });
    const wrapper = mount(<ServiceForm {...initialProps} />);

    setImmediate(() => {
      wrapper.find('button').last().simulate('click');
      expect(submitSpy).toHaveBeenCalledWith('/service/service_edit/3?button=cancel');
      done();
    });
  });

  it('should enable reset button and call reset callback', (done) => {
    fetchMock
      .getOnce('/service/service_form_fields/3', {});
    const wrapper = mount(<ServiceForm {...initialProps} />);

    setImmediate(() => {
      // reset should be disabled
      wrapper.find('button').at(1).simulate('click');
      expect(flashSpy).not.toHaveBeenCalled();
      // change value of some input to enable reset button
      wrapper.find('input').first().simulate('change', {
        target: {
          value: 'foo',
        },
      });
      wrapper.find('button').at(1).simulate('click');
      expect(flashSpy).toHaveBeenCalledWith(expect.any(String), 'warn');
      done();
    });
  });

  it('should enable submit button and call submit callback', (done) => {
    fetchMock
      .getOnce('/service/service_form_fields/3', {});
    const wrapper = mount(<ServiceForm {...initialProps} />);

    setImmediate(() => {
      // reset should be disabled
      wrapper.find('button').at(0).simulate('click');
      // change form state to enable reset button
      wrapper.find(FormRender).childAt(0).instance().form.change('name', 'foo');
      wrapper.find(FormRender).childAt(0).instance().form.change('description', 'bar');
      wrapper.find('button').at(0).simulate('click');
      expect(submitSpy).toHaveBeenCalledWith('/service/service_edit/3?button=save', { name: 'foo', description: 'bar' });
      done();
    });
  });
});
