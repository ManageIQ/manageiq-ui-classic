import React from 'react';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import GenericGroup from '../../../components/textual_summary/generic_group';
import { genericGroupData } from '../data/generic_group';

describe('GenericGroup', () => {
  it('renders title and rows', () => {
    const wrapper = shallow(<GenericGroup
      items={genericGroupData.items}
      title={genericGroupData.title}
      onClick={() => null}
    />);
    expect(wrapper.html()).toContain(genericGroupData.title);
  });

  it('renders just fine', () => {
    const group = mount(<GenericGroup
      items={genericGroupData.items}
      title={genericGroupData.title}
      onClick={() => null}
    />);
    expect(toJson(group)).toMatchSnapshot();
  });
});
