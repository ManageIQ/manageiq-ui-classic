import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { ExtraVarField } from '../../react/ansibleCatalog/extraVarField';

describe('ExtraVarField component', () => {
  const initialProps = {
    name: 'provision[0]',
    value: '2',
    isEditing: true,
    fieldName: 'key',
    label: 'Variable',
  };
  it('should render correctly', () => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    const wrapper = mount(<ExtraVarField field={initialProps} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
