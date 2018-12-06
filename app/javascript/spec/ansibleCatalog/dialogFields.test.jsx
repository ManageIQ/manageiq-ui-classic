import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { DialogFields } from '../../react/ansibleCatalog/dialogFields';

describe('DialogField component', () => {
  const initialProps = [
    { label: 'dialog1', value: 1 },
  ];
  it('should render correctly', () => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    const wrapper = shallow(<DialogFields dropdownOptions={initialProps} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  it('should verify dialog name is unique', () => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    const wrapper = mount(<DialogFields dropdownOptions={initialProps} />);
    expect(wrapper.instance().validateValue('dialog1')).toEqual('Dialog name exists');
  });
});
