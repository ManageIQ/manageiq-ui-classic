import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import DashboardToolbar from '../../components/dashboard_toolbar';

const dashboardProps = {
  allowAdd: true,
  allowReset: true,
  locked: false,
  items: [
    {
      id: 31,
      type: "button",
      text: "add",
      image: "fa fa-pie-chart fa-lg",
      title: "Add this Chart Widget"
    },
  ],
}

describe('<DashboardToolbar />', () => {
  it('renders ok', () => {
    const t = mount(<DashboardToolbar {...dashboardProps} />);
    expect(toJson(t)).toMatchSnapshot();
  });
});
