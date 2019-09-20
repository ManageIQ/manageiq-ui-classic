import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import TopologyToolbar from '../../components/topology_toolbar';

describe('<TopologyToolbar />', () => {
  it('renders ok', () => {
    const t = mount(<TopologyToolbar />);
    expect(toJson(t)).toMatchSnapshot();
  });
});
