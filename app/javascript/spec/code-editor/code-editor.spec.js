import React from 'react';
import { shallow, mount } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';

import CodeEditor, { DataDrivenFormCodeEditor } from '../../components/code-editor';
import { FieldProviderComponent } from '../helpers/fieldProvider';

describe('CodeEditor component', () => {
  let initialProps;
  beforeEach(() => {
    initialProps = {
      onChange: jest.fn(),
    };
  });

  it('should render correctly', () => {
    const wrapper = shallow(<CodeEditor {...initialProps} />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it('should render mode switches', () => {
    const wrapper = shallow(<CodeEditor {...initialProps} modes={['yaml', 'json']} />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it('should mount and assign correct props to data driven variant', () => {
    const onChange = jest.fn();
    const wrapper = mount(<DataDrivenFormCodeEditor {...initialProps} FieldProvider={FieldProviderComponent} onChange={onChange} />);
    wrapper.find(CodeEditor).props().onChange('foo');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('foo');
  });
});
