import React from 'react';
import { act } from 'react-dom/test-utils';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { FieldProviderComponent as FieldProvider } from '../helpers/fieldProvider';
import AsyncCredentials from '../../components/async-credentials/async-credentials';

describe('Async credentials component', () => {
  let initialProps;
  const DummyComponent = ({ isDisabled, ...props }) => <input {...props} />;
  beforeEach(() => {
    initialProps = {
      name: 'async-wrapper',
      fields: [{
        name: 'foo',
      }, {
        name: 'bar',
      }],
      FieldProvider,
      asyncValidate: jest.fn(),
      formOptions: {
        renderForm: fields => fields.map(field => <DummyComponent key={field.name} {...field} />),
        getState: () => ({
          values: {
            foo: 'value-foo',
            bar: 'value-bar',
            nonAsync: 'non-async',
          },
        }),
        change: jest.fn(),
      },
    };
  });

  it('should render correctly', () => {
    const wrapper = shallow(<AsyncCredentials {...initialProps} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should call async validation function on button click and set valid state to true', async(done) => {
    const asyncValidate = jest.fn().mockReturnValue(new Promise(resolve => resolve('Ok')));
    const change = jest.fn();
    const wrapper = mount(<AsyncCredentials {...initialProps} formOptions={{ ...initialProps.formOptions, change }} asyncValidate={asyncValidate} />);

    await act(async() => {
      wrapper.find('button').simulate('click');
    });
    expect(asyncValidate).toHaveBeenCalledWith({
      foo: 'value-foo',
      bar: 'value-bar',
      nonAsync: 'non-async',
    }, ['foo', 'bar']);
    expect(change).toHaveBeenCalledWith('async-wrapper', true);
    done();
  });

  it('should call async validation function on button click and set valid state to false', async(done) => {
    const asyncValidate = jest.fn().mockReturnValue(new Promise((_resolve, reject) => reject('Validation failed'))); // eslint-disable-line prefer-promise-reject-errors
    const change = jest.fn();
    const wrapper = mount(<AsyncCredentials {...initialProps} formOptions={{ ...initialProps.formOptions, change }} asyncValidate={asyncValidate} />);

    await act(async() => {
      wrapper.find('button').simulate('click');
    });
    expect(asyncValidate).toHaveBeenCalledWith({
      foo: 'value-foo',
      bar: 'value-bar',
      nonAsync: 'non-async',
    }, ['foo', 'bar']);
    expect(change).toHaveBeenCalledWith('async-wrapper', false);
    done();
  });

  it('should correctly set invalid state after input change', () => {
    const change = jest.fn();
    const getStateMock = jest.fn()
      .mockReturnValueOnce({
        values: {
          foo: 'value-foo',
          bar: 'value-bar',
          nonAsync: 'non-async',
        },
      })
      .mockReturnValue({
        values: {
          foo: 'changed-value',
          bar: 'value-bar',
          nonAsync: 'non-async',
        },
      });

    const expectedChangeCalls = [
      ['foo', 'changed-value'],
      ['async-wrapper', false],
    ];
    const wrapper = mount(<AsyncCredentials
      {...initialProps}
      formOptions={{
        ...initialProps.formOptions,
        change,
        getState: getStateMock,
      }}
    />);
    wrapper.find('input').first().simulate('change', { target: { value: 'changed-value' } });

    expect(change).toHaveBeenCalledTimes(2);
    expect(change.mock.calls).toEqual(expectedChangeCalls);
  });

  it('should correctly set valid state after input change if passed initial values', () => {
    const change = jest.fn();
    const getStateMock = jest.fn()
      .mockReturnValue({
        values: {
          foo: 'changed-value',
          bar: 'value-bar',
          nonAsync: 'non-async',
        },
      });

    const expectedChangeCalls = [
      ['foo', 'changed-value'],
      ['async-wrapper', undefined],
    ];
    const wrapper = mount(<AsyncCredentials
      {...initialProps}
      formOptions={{
        ...initialProps.formOptions,
        change,
        getState: getStateMock,
      }}
    />);
    wrapper.find('input').first().simulate('change', { target: { value: 'changed-value' } });

    expect(change).toHaveBeenCalledTimes(2);
    expect(change.mock.calls).toEqual(expectedChangeCalls);
  });

  it('should correctly set valid state after input change to initial empty values', () => {
    const change = jest.fn();
    const getStateMock = jest.fn()
      .mockReturnValueOnce({
        values: {},
      })
      .mockReturnValueOnce({
        values: {
          foo: 'changed-value',
        },
      })
      .mockReturnValueOnce({
        values: {
          foo: 'changed-value',
        },
      })
      .mockReturnValue({
        values: {},
      });

    const expectedChangeCalls = [
      ['foo', 'changed-value'],
      ['async-wrapper', false],
      ['foo', ''],
      ['async-wrapper', undefined],
    ];
    const wrapper = mount(<AsyncCredentials
      {...initialProps}
      formOptions={{
        ...initialProps.formOptions,
        change,
        getState: getStateMock,
      }}
    />);
    wrapper.find('input').first().simulate('change', { target: { value: 'changed-value' } });
    wrapper.find('input').first().simulate('change', { target: { value: '' } });
    expect(change).toHaveBeenCalledTimes(4);
    expect(change.mock.calls).toEqual(expectedChangeCalls);
  });
});
