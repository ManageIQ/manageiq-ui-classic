import React from 'react';
import { mount } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import PasswordField from '../../components/async-credentials/password-field';
import { FieldProviderComponent as FieldProvider } from '../helpers/fieldProvider';

let changeSpy;
let getStateSpy;

jest.mock('@@ddf', () => ({
  useFormApi: () => ({
    renderForm: ([secret]) => <DummyComponent {...secret} />,
    change: changeSpy,
    getState: getStateSpy,
  }),
}));

const DummyComponent = ({
  isDisabled,
  validateOnMount, // eslint-disable-line
  validate, // eslint-disable-line
  editMode, // eslint-disable-line
  buttonLabel,
  setEditMode,
  ...props
}) => <button {...props} onClick={setEditMode} disabled={isDisabled} type="button">{buttonLabel || 'Dummy'}</button>;


describe('Secret switch field component', () => {
  let initialProps;

  beforeEach(() => {
    changeSpy = jest.fn();
    getStateSpy = jest.fn().mockReturnValue({
      values: {},
      initialValues: { foo: 'value-foo', bar: 'value-bar', nonAsync: 'non-async' },
    });
    initialProps = {
      FieldProvider,
      edit: false,
      name: 'foo',
    };
  });

  afterEach(() => {
    changeSpy.mockReset();
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
    expect(wrapper.find(DummyComponent)).toHaveLength(0);
    wrapper.find('button').simulate('click');
    wrapper.update();
    expect(wrapper.find(DummyComponent)).toHaveLength(1);
  });

  it('should render correctly reset sercret field', () => {
    const wrapper = mount(<PasswordField {...initialProps} edit />);
    wrapper.find('button').simulate('click');
    expect(wrapper.find(DummyComponent)).toHaveLength(1);
    wrapper.find('button').simulate('click');
    expect(changeSpy).toHaveBeenCalledWith('foo', undefined);
  });
});
