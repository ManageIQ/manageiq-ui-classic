import React from 'react';
import { mount } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import PasswordField from '../../components/async-credentials/password-field';

let mockChangeSpy;
let mockGetStateSpy;

jest.mock('@@ddf', () => ({
  useFormApi: () => ({
    renderForm: ([secret]) => <MockDummyComponent {...secret} />,
    change: mockChangeSpy,
    getState: mockGetStateSpy,
  }),
  componentTypes: {
    TEXT_FIELD: 'text-field',
  },
}));

const MockDummyComponent = ({
  buttonLabel,
  editMode, // eslint-disable-line
  isDisabled,
  helperText, // eslint-disable-line
  setEditMode,
  validate, // eslint-disable-line
  validateOnMount, // eslint-disable-line
  ...props
}) => <button {...props} onClick={setEditMode} disabled={isDisabled} type="button">{buttonLabel || 'Dummy'}</button>;


describe('Secret switch field component', () => {
  let initialProps;

  beforeEach(() => {
    mockChangeSpy = jest.fn();
    mockGetStateSpy = jest.fn().mockReturnValue({
      values: {},
      initialValues: { foo: 'value-foo', bar: 'value-bar', nonAsync: 'non-async' },
    });
    initialProps = {
      edit: false,
      name: 'foo',
    };
  });

  afterEach(() => {
    mockChangeSpy.mockReset();
  });

  it('should render correctly in non edit mode', () => {
    const wrapper = mount(<PasswordField {...initialProps} />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly in edit mode', () => {
    const wrapper = mount(<PasswordField {...initialProps} edit />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

  /**
   * Hooks are not supported in enzyme jest.
   * Instead of adding another testing utilities we can wait for while until its added or until we know enzyme will not support hooks
   * and we can use another library
   * https://github.com/airbnb/enzyme/issues/2011
   */
  it('should render correctly switch to editing', () => {
    const wrapper = mount(<PasswordField {...initialProps} edit />);
    expect(wrapper.find(MockDummyComponent)).toHaveLength(0);
    wrapper.find('button').simulate('click');
    wrapper.update();
    expect(wrapper.find(MockDummyComponent)).toHaveLength(1);
  });

  it('should render correctly reset sercret field', () => {
    const wrapper = mount(<PasswordField {...initialProps} edit />);
    wrapper.find('button').simulate('click');
    expect(wrapper.find(MockDummyComponent)).toHaveLength(1);
    wrapper.find('button').simulate('click');
    expect(mockChangeSpy).toHaveBeenCalledWith('foo', undefined);
  });
});
