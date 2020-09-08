import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import DualList from '../../components/dual-list-select';

jest.mock('@@ddf', () => ({
  useFieldApi: props => ({ meta: {}, input: {}, ...props }),
}));

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
      value: ['key3'],
      onChange: onChangeSpy,
    },
  };

  afterEach(() => {
    onChangeSpy.mockReset();
  });

  it('is rendered correctly', () => {
    const wrapper = mount(<DualList {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('is rendered correctly with move all buttons', () => {
    const wrapper = mount(<DualList {...props} allToLeft allToRight />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('correctly moves items to right', () => {
    const wrapper = mount(<DualList {...props} />);
    const button = wrapper.find('button').first(); // find toRight button
    wrapper
      .find('select')
      .first()
      .find('option')
      .first()
      .simulate('click');
    wrapper.update();
    button.simulate('click');

    expect(onChangeSpy).toHaveBeenCalledWith(['key3', 'key1']);
  });

  it('correctly moves items to left', () => {
    const wrapper = mount(<DualList {...props} />);
    wrapper
      .find('select')
      .last()
      .find('option')
      .first()
      .simulate('click');
    const button = wrapper.find('button').last(); // find toLeft button
    button.simulate('click');

    expect(onChangeSpy).toHaveBeenCalledWith([]);
  });

  it('correctly move all items to right', () => {
    const wrapper = mount(<DualList {...props} allToRight />);
    const button = wrapper.find('button').at(1); // find allRoLeft button
    button.simulate('click');

    expect(onChangeSpy).toHaveBeenCalledWith(['key1', 'key2', 'key3', 'key4']);
  });

  it('correctly move all items to left', () => {
    const wrapper = mount(<DualList {...props} allToLeft />);
    const button = wrapper.find('button').at(1); // find allToLeft button
    button.simulate('click');

    expect(onChangeSpy).toHaveBeenCalledWith([]);
  });

  it('correctly moves items to right when holding shift key', () => {
    const wrapper = mount(<DualList {...props} />);
    const button = wrapper.find('button').first(); // find toRight button
    wrapper
      .find('select')
      .first()
      .find('option')
      .first()
      .simulate('click');
    wrapper.update();
    wrapper
      .find('select')
      .first()
      .find('option')
      .first()
      .simulate('click', { shiftKey: true, target: { value: 'key2' } });
    wrapper.update();
    button.simulate('click');

    expect(onChangeSpy).toHaveBeenCalledWith(['key3', 'key1', 'key2']);
  });

  it('correctly moves items to left when holding shift key', () => {
    const wrapper = mount(<DualList {...props} input={{ ...props.input, value: ['key3', 'key2'] }} />);
    const button = wrapper.find('button').last(); // find toRight button
    wrapper
      .find('select')
      .last()
      .find('option')
      .first()
      .simulate('click');
    wrapper.update();
    wrapper
      .find('select')
      .last()
      .find('option')
      .last()
      .simulate('click', { shiftKey: true, target: { value: 'key3' } });
    wrapper.update();
    button.simulate('click');

    expect(onChangeSpy).toHaveBeenCalledWith([]);
  });
});
