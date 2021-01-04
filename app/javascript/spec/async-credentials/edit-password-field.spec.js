import React from 'react';
import { shallow, mount } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import { HelpBlock } from 'patternfly-react';
import EditPasswordField from '../../components/async-credentials/edit-password-field';

jest.mock('@@ddf', () => ({
  useFieldApi: props => ({ meta: {}, input: {}, ...props }),
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
    expect(wrapper.find(HelpBlock)).toBeTruthy();
  });

  it('should call setEditMode on input button click', () => {
    const setEditMode = jest.fn();
    const wrapper = mount(<EditPasswordField {...initialProps} setEditMode={setEditMode} />);
    wrapper.find('button').simulate('click');
    expect(setEditMode).toHaveBeenCalled();
  });
});
