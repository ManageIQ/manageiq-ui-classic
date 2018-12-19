import React from 'react';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { ExtraVarRow } from '../../react/ansibleCatalog/extraVarRow';

describe('ExtraVarRow component', () => {
  const initialProps = {
    changeField: jest.fn(),
    removeField: jest.fn(),
    fieldIndex: 1,
    values: [
      { key: 'field1', default: '' },
      { key: 'field2', default: '' },
    ],
    fieldName: 'provisionExtraVars',
    extraVarsField: 'provisionExtraVars[0]',
  };

  it('should render correctly', () => {
    const wrapper = mount(<ExtraVarRow {...initialProps} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should allow a field to update', () => {
    const wrapper = shallow(<ExtraVarRow {...initialProps} />);
    const instance = wrapper.instance();
    instance.setState({
      isEditing: true,
      row: {
        key: 'test',
        default: 'test',
      },
    });
    instance.updateField();

    expect(instance.state.isEditing).toBeFalsy();
  });

  it('should allow a field to be deleted', () => {
    const removeField = jest.fn();
    const props = { ...initialProps, removeField };
    const wrapper = shallow(<ExtraVarRow {...props} />);
    const instance = wrapper.instance();
    instance.removeField();
    expect(removeField).toHaveBeenCalledWith(1);
  });

  it('should allow a button to be rendered', () => {
    const wrapper = mount(<ExtraVarRow {...initialProps} />);
    const button = wrapper.instance().renderButton('pficon-edit', 'pficon-save', jest.fn());
    const buttonWrapper = mount(button);
    expect(toJson(buttonWrapper)).toMatchSnapshot();
  });

  it('should handle when the remove button is clicked', () => {
    const wrapper = mount(<ExtraVarRow {...initialProps} />);
    const instance = wrapper.instance();
    instance.setState({ isEditing: true });
    const revertMethod = jest.fn();
    instance.revertField = revertMethod;
    wrapper.update();
    instance.handleRemoveClick();
    expect(revertMethod).toHaveBeenCalled();
  });
});
