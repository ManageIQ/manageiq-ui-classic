import React from 'react';
import { shallow, mount } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';

import CodeEditor, { DataDrivenFormCodeEditor } from '../../components/code-editor';
import { FieldProviderComponent } from '../helpers/fieldProvider';

describe('CodeEditor component', () => {
  let initialProps;
  beforeEach(() => {
    initialProps = {
      onBeforeChange: jest.fn(),
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
    const onBeforeChange = jest.fn();
    const wrapper = mount(<DataDrivenFormCodeEditor {...initialProps} FieldProvider={FieldProviderComponent} onBeforeChange={onBeforeChange} />);
    wrapper.find(CodeEditor).props().onBeforeChange('foo');
    expect(onBeforeChange).toHaveBeenCalledTimes(1);
    expect(onBeforeChange).toHaveBeenCalledWith('foo');
  });
});
