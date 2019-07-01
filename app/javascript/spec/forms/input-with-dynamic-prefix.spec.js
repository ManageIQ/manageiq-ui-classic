import React from 'react';
import { mount, shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import { HelpBlock, InputGroup } from 'patternfly-react';
import { rawComponents } from '@data-driven-forms/pf3-component-mapper';

import { FieldProviderComponent as FieldProvider } from '../helpers/fieldProvider';
import DataDrivenInputWithPrefix from '../../forms/input-with-dynamic-prefix';
import RequiredLabel from '../../forms/required-label';

describe('DataDrivenInputWithPrefix', () => {
  let initialProps;

  beforeEach(() => {
    initialProps = {
      FieldProvider,
      label: 'foo',
      name: 'foo',
      prefixOptions: [{
        label: 'Foo',
        value: 'foo://',
      }, {
        label: 'Bar',
        value: 'bar://',
      }, {
        label: 'Quxx',
        value: 'https://',
      }],
      formOptions: {
        getFieldState: (name) => {
          if (name === 'prefix') {
            return {
              initial: 'prefix://',
            };
          }
          if (name === 'uri') {
            return {
              initial: 'uri://test',
            };
          }
          return {
            initial: undefined,
          };
        },
      },
    };
  });

  it('should render correctly', () => {
    const wrapper = shallow(<DataDrivenInputWithPrefix {...initialProps} />).dive();
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it('should render only select if no prefix was chosen', () => {
    const wrapper = mount(<DataDrivenInputWithPrefix {...initialProps} />);
    expect(wrapper.find('#dynamic-prefix-select-foo').length).toBeGreaterThan(0);
    expect(wrapper.find('#dynamic-prefix-text-input-foo')).toHaveLength(0);
  });

  it('should render text field if prefix was chosen', () => {
    const wrapper = mount(<DataDrivenInputWithPrefix {...initialProps} name="prefix" input={{ value: 'foo://', name: 'foo' }} />);
    const textInput = wrapper.find('input#dynamic-prefix-text-input-prefix');
    expect(textInput).toHaveLength(1);
  });

  it('should render in error state if part after prefix is not filled in', () => {
    const onChange = jest.fn().mockReturnValue('');
    const wrapper = mount(<DataDrivenInputWithPrefix {...initialProps} name="prefix" input={{ onChange, value: 'foo://', name: 'foo' }} />);

    expect(wrapper.find(HelpBlock)).toHaveLength(0);
    /**
     * Find and call on change value
     */
    const textInput = wrapper.find('input#dynamic-prefix-text-input-prefix');
    textInput.simulate('change', '');
    expect(onChange).toHaveBeenCalledWith('prefix://');
    /**
     * set Error state
     */
    wrapper.setProps({ meta: { error: 'Required' } });
    wrapper.update();
    /**
     * find error message
     */
    expect(wrapper.find(HelpBlock)).toHaveLength(1);
  });

  it('should call component validation', () => {
    const onChange = jest.fn();
    const validate = jest.fn();
    const wrapper = mount(
      <DataDrivenInputWithPrefix
        {...initialProps}
        name="uri"
        validate={validate}
        input={{ onChange, value: 'foo://', name: 'foo' }}
      />,
    );

    const textInput = wrapper.find('input#dynamic-prefix-text-input-uri');
    textInput.simulate('change', { target: { value: 'bar' } });

    expect(validate).toHaveBeenCalledWith('uri://bar');
  });

  it('should set prefix correctly', () => {
    const onChange = jest.fn();
    const wrapper = mount(<DataDrivenInputWithPrefix {...initialProps} input={{ onChange, value: '' }} />);
    /**
     * select corret option from list
     */
    wrapper.find(rawComponents.Select).children().instance().onChange({
      label: 'Quxx',
      value: 'https://',
    });
    expect(onChange).toHaveBeenCalledWith('https://');
    wrapper.update();
    /**
     * check if prefix was changed correctly
     */
    const prefix = wrapper.find(InputGroup.Addon);
    expect(prefix.props().children).toEqual('https://');
  });

  it('should render in required state', () => {
    const wrapper = mount(<DataDrivenInputWithPrefix {...initialProps} isRequired />);
    expect(wrapper.find(RequiredLabel)).toHaveLength(1);
  });
});
