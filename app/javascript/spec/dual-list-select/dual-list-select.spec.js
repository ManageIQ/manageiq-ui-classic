import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import DualList from '../../components/dual-list-select';
import List from '../../components/dual-list-select/list';
import { FieldProviderComponent as FieldProvider } from '../helpers/fieldProvider';

describe('Dual list component', () => {
  const onChangeSpy = jest.fn();

  const props = {
    options: [
      { key: 'key1', label: 'text1' },
      { key: 'key2', label: 'text2' },
      { key: 'key3', label: 'text3' },
      { key: 'key4', label: 'text4' },
    ],
    input: {
      value: [{ key: 'key3', label: 'text3' }],
      onChange: onChangeSpy,
    },
  };

  afterEach(() => {
    onChangeSpy.mockReset();
  });

  it('is correctly rendered', () => {
    const wrapper = mount(<DualList FieldProvider={FieldProvider} {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('is correctly moves items to right', () => {
    const wrapper = mount(<DualList FieldProvider={FieldProvider} {...props} />);
    const leftSelect = wrapper.find(List).first().find('select').getDOMNode();
    const button = wrapper.find('button').first(); // find toRight button

    expect(onChangeSpy).not.toHaveBeenCalled();

    leftSelect.selectedIndex = 0; // 'select' first option
    button.simulate('click');

    expect(onChangeSpy).toHaveBeenCalledWith([
      { key: 'key3', label: 'text3' },
      { key: 'key1', label: 'text1' },
    ]);
  });

  it('is correctly moves items to left', () => {
    const wrapper = mount(<DualList FieldProvider={FieldProvider} {...props} />);
    const rightSelect = wrapper.find(List).last().find('select').getDOMNode();
    const button = wrapper.find('button').last(); // find toLeft button

    expect(onChangeSpy).not.toHaveBeenCalled();

    rightSelect.selectedIndex = 0; // 'select' first option
    button.simulate('click');

    expect(onChangeSpy).toHaveBeenCalledWith([]);
  });

  it('is correctly moves all items to right', () => {
    const wrapper = mount(<DualList FieldProvider={FieldProvider} {...props} />);
    const button = wrapper.find('button').at(1); // find allToRight button

    expect(onChangeSpy).not.toHaveBeenCalled();

    button.simulate('click');

    expect(onChangeSpy).toHaveBeenCalledWith([
      { key: 'key3', label: 'text3' },
      { key: 'key1', label: 'text1' },
      { key: 'key2', label: 'text2' },
      { key: 'key4', label: 'text4' },
    ]);
  });

  it('is correctly moves all items to left', () => {
    const wrapper = mount(<DualList allToLeft FieldProvider={FieldProvider} {...props} />);
    const button = wrapper.find('button').at(2); // find allToLeft button

    expect(onChangeSpy).not.toHaveBeenCalled();

    button.simulate('click');

    expect(onChangeSpy).toHaveBeenCalledWith([]);
  });
});
