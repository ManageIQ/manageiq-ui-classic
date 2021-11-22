import React from 'react';
import { shallow, mount } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import EditPasswordField from '../../components/async-credentials/edit-password-field';
import HelperTextBlock from '../../forms/helper-text-block';

jest.mock('@@ddf', () => ({
  useFieldApi: props => ({ meta: {}, input: {}, ...props }),
  componentTypes: {
    TEXT_FIELD: 'text-field',
  },
}));

describe('Edit secret field form component', () => {
  let initialProps;
  beforeEach(() => {
    initialProps = {
      label: 'foo',
      setEditMode: jest.fn(),
    };
  });

  it('should render correctly', () => {
    const wrapper = shallow(<EditPasswordField {...initialProps} />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly in error state', () => {
    initialProps.meta = { error: 'error message' };
    const wrapper = mount(<EditPasswordField {...initialProps} />);
    expect(wrapper.find(HelperTextBlock)).toBeTruthy();
  });

  it('should call setEditMode on input button click', () => {
    const setEditMode = jest.fn();
    const wrapper = mount(<EditPasswordField {...initialProps} setEditMode={setEditMode} />);
    wrapper.find('button').simulate('click');
    expect(setEditMode).toHaveBeenCalled();
  });
});
