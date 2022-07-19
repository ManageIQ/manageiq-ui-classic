import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import ContainerProjects from '../../components/container-projects';

describe('Container Project component', () => {
  it('should render the dashboard', () => {
    const wrapper = shallow(<ContainerProjects url="/container_dashboard/project_data" />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
