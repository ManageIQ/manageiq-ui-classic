import React from 'react';
import { act } from 'react-dom/test-utils';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import FormRenderer from '@data-driven-forms/react-form-renderer';
import { FormTemplate, componentMapper } from '@data-driven-forms/pf3-component-mapper';
import AsyncCredentials from '../../components/async-credentials/async-credentials';

const RendererWrapper = ({ asyncValidate, onSubmit = () => {}, ...props }) => (
  <FormRenderer
    onSubmit={onSubmit}
    FormTemplate={FormTemplate}
    componentMapper={{
      ...componentMapper,
      'async-credentials': AsyncCredentials,
    }}
    schema={{
      fields: [{
        component: 'async-credentials',
        name: 'validate_credentials',
        asyncValidate,
        fields: [{
          component: 'text-field',
          name: 'foo',
          initialValue: 'bar',
        }],
      }],
    }}
    {...props}
  />
);

describe('Async credentials component', () => {
  it('should render correctly', async(done) => {
    const wrapper = mount(<RendererWrapper asyncValidate={() => {}} />);
    setImmediate(() => {
      expect(toJson(wrapper.find(AsyncCredentials))).toMatchSnapshot();
      done();
    });
  });


  it('should call async validation function on button click and set valid state to true', async(done) => {
    const asyncValidate = jest.fn().mockReturnValue(new Promise(resolve => resolve('Ok')));
    const onSubmit = jest.fn();

    const wrapper = mount(<RendererWrapper asyncValidate={asyncValidate} onSubmit={onSubmit} />);

    await act(async() => {
      wrapper.find('input[name="foo"]').simulate('change', { target: { value: 'baz' } });
      setImmediate(() => wrapper.find('button[type="button"]').simulate('click'));
    });
    expect(asyncValidate).toHaveBeenCalledWith({
      foo: 'baz',
      validate_credentials: false,
    }, ['foo']);

    wrapper.find('form').simulate('submit');
    expect(onSubmit).toHaveBeenCalledWith({ foo: 'baz', validate_credentials: true }, expect.anything(), expect.anything());

    done();
  });

  it('should call async validation function on button click and set valid state to false', async(done) => {
    const asyncValidate = jest.fn(() => Promise.reject('Validation failed'));
    const onSubmit = jest.fn();

    const wrapper = mount(<RendererWrapper asyncValidate={asyncValidate} onSubmit={onSubmit} />);

    await act(async() => {
      wrapper.find('input[name="foo"]').simulate('change', { target: { value: 'baz' } });
      setImmediate(() => wrapper.find('button[type="button"]').simulate('click'));
    });
    expect(asyncValidate).toHaveBeenCalledWith({
      foo: 'baz',
      validate_credentials: false,
    }, ['foo']);

    wrapper.update();

    expect(wrapper.find('span.help-block').text()).toEqual('Validation failed');

    done();
  });

  it('should correctly set invalid state after input change', async(done) => {
    const asyncValidate = jest.fn().mockReturnValue(new Promise(resolve => resolve('Ok')));
    const wrapper = mount(<RendererWrapper asyncValidate={asyncValidate} />);

    await act(async() => {
      wrapper.find('input[name="foo"]').simulate('change', { target: { value: 'baz' } });
      setImmediate(() => wrapper.find('button[type="button"]').simulate('click'));
    });

    wrapper.update();

    expect(wrapper.find('span.help-block').text()).toEqual('Validation successful');
    wrapper.find('input[name="foo"]').simulate('change', { target: { value: 'test' } });
    wrapper.update();
    expect(wrapper.find('span.help-block').text()).toEqual('Validation Required');

    done();
  });

  it('should correctly set valid state after input change if passed initial values', async(done) => {
    const asyncValidate = jest.fn().mockReturnValue(new Promise(resolve => resolve('Ok')));
    const wrapper = mount(<RendererWrapper asyncValidate={asyncValidate} />);

    await act(async() => {
      wrapper.find('input[name="foo"]').simulate('change', { target: { value: 'baz' } });
      setImmediate(() => wrapper.find('button[type="button"]').simulate('click'));
    });

    wrapper.update();

    expect(wrapper.find('span.help-block').text()).toEqual('Validation successful');
    wrapper.find('input[name="foo"]').simulate('change', { target: { value: 'test' } });
    wrapper.update();
    expect(wrapper.find('span.help-block').text()).toEqual('Validation Required');
    wrapper.find('input[name="foo"]').simulate('change', { target: { value: 'baz' } });
    wrapper.update();
    expect(wrapper.find('span.help-block').text()).toEqual('Validation successful');

    done();
  });
});
